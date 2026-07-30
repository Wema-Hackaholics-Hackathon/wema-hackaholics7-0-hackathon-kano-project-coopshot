const { Group, GroupMember, Loan, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { computeLoanEligibility } = require('../utils/loanEligibility');

async function requireActiveMember(groupId, userId) {
  return GroupMember.findOne({ where: { groupId, userId, status: 'active' } });
}

// Member requests a loan up to (group's loanMultiplier x their total equity +
// monthly contributions). Eligibility is recomputed server-side — the client
// only shows it, it never gets to decide its own borrowing limit.
const requestLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  const membership = await requireActiveMember(id, req.user.id);
  if (!membership) {
    return res.status(403).json({ message: 'Only active members can request a loan' });
  }

  if (!(Number(amount) > 0)) {
    return res.status(400).json({ message: 'Loan amount must be greater than 0' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const existingPending = await Loan.findOne({ where: { groupId: id, userId: req.user.id, status: 'pending' } });
  if (existingPending) {
    return res.status(409).json({ message: 'You already have a pending loan request with this cooperative' });
  }

  const { myMaxLoanAmount } = await computeLoanEligibility(group, req.user.id);

  if (Number(amount) > myMaxLoanAmount) {
    return res.status(400).json({
      message: `Requested amount exceeds your loan eligibility of ₦${myMaxLoanAmount.toLocaleString()}`,
    });
  }

  const loan = await Loan.create({
    groupId: id,
    userId: req.user.id,
    amount,
    eligibleAmount: myMaxLoanAmount,
    status: 'pending',
  });

  res.status(201).json(loan);
});

// Member's own loan request history for this group, newest first.
const getMyLoans = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loans = await Loan.findAll({
    where: { groupId: id, userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });

  res.json(loans);
});

// Admin-only: every loan request made to this group, newest first.
const getGroupLoans = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const membership = await requireActiveMember(id, req.user.id);
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ message: 'Only the group admin can view loan requests' });
  }

  const loans = await Loan.findAll({
    where: { groupId: id },
    include: [
      { model: User, as: 'requester', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'decider', attributes: ['id', 'name', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json(loans);
});

// Admin approves or rejects a pending loan request.
const decideLoan = asyncHandler(async (req, res) => {
  const { id, loanId } = req.params;
  const { status, note } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: "Decision status must be 'approved' or 'rejected'" });
  }

  const membership = await requireActiveMember(id, req.user.id);
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ message: 'Only the group admin can decide loan requests' });
  }

  const loan = await Loan.findOne({ where: { id: loanId, groupId: id } });
  if (!loan) {
    return res.status(404).json({ message: 'Loan request not found' });
  }
  if (loan.status !== 'pending') {
    return res.status(409).json({ message: 'This loan request has already been decided' });
  }

  loan.status = status;
  loan.decidedByUserId = req.user.id;
  loan.decidedAt = new Date();
  loan.decisionNote = note || null;
  await loan.save();

  res.json(loan);
});

module.exports = { requestLoan, getMyLoans, getGroupLoans, decideLoan };
