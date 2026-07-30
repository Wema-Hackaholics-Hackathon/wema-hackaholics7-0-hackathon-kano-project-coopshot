const { Group, GroupMember, Contribution, TreasuryInvestment, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

async function requireActiveMembership(groupId, userId) {
  return GroupMember.findOne({ where: { groupId, userId, status: 'active' } });
}

// A unified, group-wide activity feed: every member's successful contributions
// plus treasury investment payouts, merged into one timeline. There's no
// per-member "rotation payout" in this backend's model — contributions fund a
// pooled treasury investment, not a rotating individual payout — so unlike
// asusu's mock ledger, "payout" entries here mean a matured treasury cycle,
// not a member's turn in a rotation.
const getGroupLedger = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const membership = await requireActiveMembership(id, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: 'You are not an active member of this group' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const contributions = await Contribution.findAll({
    where: { groupId: id, status: 'success' },
    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    order: [['paidAt', 'DESC']],
  });

  const investments = await TreasuryInvestment.findAll({
    where: { groupId: id, status: 'matured' },
    order: [['distributedAt', 'DESC']],
  });

  const contributionEntries = contributions.map((c) => ({
    id: `contribution-${c.id}`,
    type: 'contribution',
    category: c.type,
    amount: Number(c.amount),
    description: c.type === 'registration'
      ? `Cooperative Income: Registration Fee — ${c.user.name}`
      : c.type === 'equity'
      ? `Member Share Capital Equity — ${c.user.name}`
      : `Monthly Savings Contribution — ${c.user.name} (${c.month})`,
    createdAt: c.paidAt,
  }));

  const payoutEntries = investments.map((inv) => ({
    id: `investment-${inv.id}`,
    type: 'payout',
    amount: Number(inv.principal) + Number(inv.returnAmount),
    description: `Treasury bill matured — principal + ₦${Number(inv.returnAmount).toLocaleString()} interest returned to pool`,
    createdAt: inv.distributedAt,
  }));

  const ledger = [...contributionEntries, ...payoutEntries].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const totalContributed = contributionEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalRegistrationIncome = contributions
    .filter((c) => c.type === 'registration')
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const totalEquityCapital = contributions
    .filter((c) => c.type === 'equity')
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const totalMonthlySavings = contributions
    .filter((c) => c.type === 'monthly')
    .reduce((sum, c) => sum + Number(c.amount), 0);
  const totalPayouts = payoutEntries.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    ledger,
    summary: {
      total_contributed: totalContributed,
      total_registration_income: totalRegistrationIncome,
      total_equity_capital: totalEquityCapital,
      total_monthly_savings: totalMonthlySavings,
      total_payouts: totalPayouts,
      current_balance: Number(group.treasuryPoolBalance),
    },
  });
});

// This member's next contribution due date. There's no per-day due-date
// configured on a group — "due" is defined as the end of the current
// calendar month once the group is active.
const getNextDueDate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const membership = await requireActiveMembership(id, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: 'You are not an active member of this group' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (group.status !== 'active') {
    return res.json({
      next_due_date: null,
      days_until_due: null,
      amount_expected: Number(group.monthlyAmount),
      late_fee: Number(group.lateFeeAmount),
      has_contributed_this_period: false,
    });
  }

  const month = currentMonth();
  const paid = await Contribution.findOne({
    where: { groupId: id, userId: req.user.id, month, type: 'monthly', status: 'success' },
  });

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysUntil = Math.ceil((endOfMonth - now) / (1000 * 60 * 60 * 24));

  res.json({
    next_due_date: endOfMonth.toISOString().slice(0, 10),
    days_until_due: daysUntil,
    amount_expected: Number(group.monthlyAmount),
    late_fee: Number(group.lateFeeAmount),
    has_contributed_this_period: !!paid,
  });
});

// Derived late-fee penalties: one per past month (since this member went
// active) where they had no successful monthly contribution. Only meaningful
// if the group admin has set a non-zero lateFeeAmount — otherwise there's
// nothing to derive and this returns an empty list, honestly.
const getMyPenalties = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const membership = await requireActiveMembership(id, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: 'You are not an active member of this group' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (Number(group.lateFeeAmount) <= 0) {
    return res.json({
      penalties: [],
      summary: { active_total: 0, waived_total: 0, grand_total: 0 },
      count: { total: 0, active: 0, waived: 0 },
    });
  }

  const paidContributions = await Contribution.findAll({
    where: { groupId: id, userId: req.user.id, type: 'monthly', status: 'success' },
  });
  const paidMonths = new Set(paidContributions.map((c) => c.month));

  const activatedAt = new Date(membership.updatedAt);
  const now = new Date();
  const thisMonth = currentMonth();

  const penalties = [];
  const cursor = new Date(activatedAt.getFullYear(), activatedAt.getMonth(), 1);
  while (cursor < now) {
    const monthStr = cursor.toISOString().slice(0, 7);
    if (monthStr !== thisMonth && !paidMonths.has(monthStr)) {
      penalties.push({
        id: penalties.length + 1,
        amount: Number(group.lateFeeAmount),
        description: `Missed contribution for ${monthStr}`,
        date: new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).toISOString().slice(0, 10),
        waived: false,
        waived_at: null,
        waived_by: null,
        is_active: true,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const activeTotal = penalties.reduce((sum, p) => sum + p.amount, 0);

  res.json({
    penalties,
    summary: { active_total: activeTotal, waived_total: 0, grand_total: activeTotal },
    count: { total: penalties.length, active: penalties.length, waived: 0 },
  });
});

module.exports = { getGroupLedger, getNextDueDate, getMyPenalties };
