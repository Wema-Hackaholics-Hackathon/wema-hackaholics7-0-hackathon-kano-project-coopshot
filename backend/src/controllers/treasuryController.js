const { Group, GroupMember, TreasuryBill, TreasuryAllocation, TreasuryInvestment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { calculateInvestmentAccrual, isMatureEnoughToDistribute } = require('../services/treasuryBillService');

async function requireAdmin(groupId, userId) {
  const membership = await GroupMember.findOne({ where: { groupId, userId, status: 'active' } });
  return membership && membership.role === 'admin' ? membership : null;
}

// Sandbox catalog of money-market treasury bill products an admin can connect a group to
const listTreasuryBills = asyncHandler(async (req, res) => {
  const bills = await TreasuryBill.findAll({ order: [['tenorDays', 'ASC']] });
  res.json(bills);
});

// Admin picks/connects which sandbox treasury bill product future investment
// cycles for this group will use
const connectTreasuryBill = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { treasuryBillId } = req.body;

  if (!(await requireAdmin(id, req.user.id))) {
    return res.status(403).json({ message: 'Only the group admin can connect a treasury bill product' });
  }

  const bill = await TreasuryBill.findByPk(treasuryBillId);
  if (!bill) {
    return res.status(404).json({ message: 'Treasury bill product not found' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  group.treasuryBillId = bill.id;
  await group.save();

  res.json({ ...group.toJSON(), treasuryBill: bill });
});

// The actual "investing" action: sweep the group's current uninvested pool
// balance into a purchase of the connected treasury bill product
const investPoolBalance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!(await requireAdmin(id, req.user.id))) {
    return res.status(403).json({ message: 'Only the group admin can invest the treasury pool' });
  }

  const group = await Group.findByPk(id, { include: [{ model: TreasuryBill, as: 'treasuryBill' }] });
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  if (!group.treasuryBillId) {
    return res.status(400).json({ message: 'Connect a treasury bill product before investing' });
  }
  if (Number(group.treasuryPoolBalance) <= 0) {
    return res.status(400).json({ message: 'There is no uninvested balance to put into a treasury bill yet' });
  }

  const principal = Number(group.treasuryPoolBalance);
  const purchasedAt = new Date();
  const maturityDate = new Date(purchasedAt.getTime() + group.treasuryBill.tenorDays * 24 * 60 * 60 * 1000);

  const investment = await TreasuryInvestment.create({
    groupId: id,
    treasuryBillId: group.treasuryBillId,
    principal,
    interestRate: group.treasuryBill.interestRate,
    tenorDays: group.treasuryBill.tenorDays,
    purchasedAt,
    maturityDate,
    status: 'active',
  });

  group.treasuryPoolBalance = 0;
  await group.save();

  res.status(201).json(investment);
});

// Once an investment cycle reaches maturity, the admin distributes principal +
// interest back into the pool, ready to be reinvested (or, in a fuller build,
// paid out to members)
const distributeInvestmentReturns = asyncHandler(async (req, res) => {
  const { id, investmentId } = req.params;

  if (!(await requireAdmin(id, req.user.id))) {
    return res.status(403).json({ message: 'Only the group admin can distribute investment returns' });
  }

  const investment = await TreasuryInvestment.findOne({ where: { id: investmentId, groupId: id } });
  if (!investment) {
    return res.status(404).json({ message: 'Investment not found' });
  }
  if (investment.status !== 'active') {
    return res.status(409).json({ message: 'This investment has already been distributed' });
  }
  if (!isMatureEnoughToDistribute(investment)) {
    return res.status(400).json({ message: `This investment matures on ${investment.maturityDate.toISOString().slice(0, 10)}` });
  }

  const returnAmount = calculateInvestmentAccrual({ ...investment.toJSON(), purchasedAt: investment.purchasedAt });
  investment.status = 'matured';
  investment.returnAmount = returnAmount;
  investment.distributedAt = new Date();
  await investment.save();

  const group = await Group.findByPk(id);
  group.treasuryPoolBalance = Number(group.treasuryPoolBalance) + Number(investment.principal) + returnAmount;
  await group.save();

  res.json({ investment, newPoolBalance: Number(group.treasuryPoolBalance) });
});

// Treasury investment summary for a group: connected product, uninvested pool
// balance, and every investment cycle (active + matured) with live current value
const getGroupTreasurySummary = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const membership = await GroupMember.findOne({
    where: { groupId: id, userId: req.user.id, status: 'active' },
  });
  if (!membership) {
    return res.status(403).json({ message: 'You are not an active member of this group' });
  }

  const group = await Group.findByPk(id, {
    include: [{ model: TreasuryBill, as: 'treasuryBill' }],
  });
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const allocations = await TreasuryAllocation.findAll({ where: { groupId: id } });
  const totalAllocatedEver = allocations.reduce((sum, a) => sum + Number(a.amount), 0);

  const investmentRows = await TreasuryInvestment.findAll({
    where: { groupId: id },
    include: [{ model: TreasuryBill, as: 'treasuryBill' }],
    order: [['purchasedAt', 'DESC']],
  });

  const investments = investmentRows.map((inv) => {
    const isActive = inv.status === 'active';
    const accrued = isActive ? calculateInvestmentAccrual(inv) : Number(inv.returnAmount);
    return {
      id: inv.id,
      treasuryBill: inv.treasuryBill,
      principal: Number(inv.principal),
      interestRate: Number(inv.interestRate),
      tenorDays: inv.tenorDays,
      purchasedAt: inv.purchasedAt,
      maturityDate: inv.maturityDate,
      status: inv.status,
      returnAmount: inv.returnAmount !== null ? Number(inv.returnAmount) : null,
      currentValue: Number(inv.principal) + accrued,
      canDistribute: isActive && isMatureEnoughToDistribute(inv),
    };
  });

  const totalReturnsEarned = investments
    .filter((inv) => inv.status === 'matured')
    .reduce((sum, inv) => sum + inv.returnAmount, 0);

  res.json({
    connected: !!group.treasuryBillId,
    treasuryBill: group.treasuryBill,
    poolBalance: Number(group.treasuryPoolBalance),
    totalAllocatedEver,
    totalReturnsEarned,
    investments,
  });
});

module.exports = {
  listTreasuryBills,
  connectTreasuryBill,
  investPoolBalance,
  distributeInvestmentReturns,
  getGroupTreasurySummary,
};
