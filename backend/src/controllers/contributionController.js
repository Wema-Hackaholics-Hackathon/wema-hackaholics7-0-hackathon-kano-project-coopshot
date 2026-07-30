const crypto = require('crypto');
const { Contribution, Group, GroupMember, TreasuryAllocation, TreasuryBill, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { initializeTransaction, verifyTransaction } = require('../services/paystackService');

const TREASURY_ALLOCATION_RATE = 0.05; // 5% of every monthly contribution

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

async function findMembership(groupId, userId) {
  return GroupMember.findOne({ where: { groupId, userId } });
}

// Runs once a contribution is confirmed successful, whether via the callback
// verify endpoint or the Paystack webhook — both paths funnel through here so
// the "activate membership" / "allocate to treasury" side effects only happen once.
// paidAmountKobo is whatever Paystack itself reports as charged — verified against
// what we expected before any money is credited, so a mismatched/tampered amount
// can't silently activate a membership or count as a full contribution.
async function handleSuccessfulContribution(contribution, paidAmountKobo) {
  if (contribution.status === 'success') return; // already processed

  const expectedKobo = Math.round(Number(contribution.amount) * 100);
  if (paidAmountKobo !== expectedKobo) {
    contribution.status = 'failed';
    await contribution.save();
    return;
  }

  contribution.status = 'success';
  contribution.paidAt = new Date();
  await contribution.save();

  if (contribution.type === 'registration' || contribution.type === 'equity') {
    const membership = await findMembership(contribution.groupId, contribution.userId);
    if (membership && membership.status !== 'active') {
      membership.status = 'active';
      await membership.save();
    }
    return;
  }

  // Monthly contribution: 5% goes into the group's treasury bill ledger (an
  // immutable audit record) and into the spendable pool balance the admin can
  // actually invest
  const group = await Group.findByPk(contribution.groupId);
  const treasuryBill = group.treasuryBillId ? await TreasuryBill.findByPk(group.treasuryBillId) : null;
  const allocationAmount = Number(contribution.amount) * TREASURY_ALLOCATION_RATE;

  await TreasuryAllocation.create({
    groupId: contribution.groupId,
    contributionId: contribution.id,
    amount: allocationAmount,
    interestRate: treasuryBill ? treasuryBill.interestRate : 0,
  });

  group.treasuryPoolBalance = Number(group.treasuryPoolBalance) + allocationAmount;
  await group.save();
}

// Start a Paystack transaction — registration fee, equity payment, or monthly contribution
const initiateContribution = asyncHandler(async (req, res) => {
  const { groupId, month, type } = req.body;
  const contributionType = type === 'registration' ? 'registration' : type === 'equity' ? 'equity' : 'monthly';

  if (!groupId) {
    return res.status(400).json({ message: 'groupId is required' });
  }

  const group = await Group.findByPk(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const membership = await findMembership(groupId, req.user.id);
  if (!membership || membership.status === 'removed') {
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  let amount;
  let contributionMonth = null;

  const alreadyPaidRegistration = await Contribution.findOne({
    where: { groupId, userId: req.user.id, type: 'registration', status: 'success' },
  });
  const alreadyPaidEquity = await Contribution.findOne({
    where: { groupId, userId: req.user.id, type: 'equity', status: 'success' },
  });

  if (contributionType === 'registration') {
    if (alreadyPaidRegistration) {
      return res.status(409).json({ message: 'You have already paid the registration fee for this group' });
    }
    amount = group.registrationFee;
  } else if (contributionType === 'equity') {
    if (alreadyPaidEquity) {
      return res.status(409).json({ message: 'You have already paid the equity share capital for this group' });
    }
    amount = group.equityAmount || 25000;
  } else {
    const hasReg = Number(group.registrationFee) === 0 || alreadyPaidRegistration;
    const hasEq = Number(group.equityAmount) === 0 || alreadyPaidEquity;
    if (!hasReg || !hasEq) {
      return res.status(403).json({ message: 'Pay your one-time onboarding fees before making monthly contributions' });
    }
    if (group.status !== 'active') {
      return res.status(403).json({ message: 'The group admin hasn\'t started this cooperative yet' });
    }
    contributionMonth = month || currentMonth();
    const alreadyPaid = await Contribution.findOne({
      where: { groupId, userId: req.user.id, month: contributionMonth, type: 'monthly', status: 'success' },
    });
    if (alreadyPaid) {
      return res.status(409).json({ message: `You have already paid for ${contributionMonth}` });
    }
    amount = group.monthlyAmount;
  }

  // Supersede any earlier unfinished attempt for this same payment (abandoned
  // checkout, closed tab, etc.) so retries don't pile up as permanent "pending"
  // rows in the member's history
  await Contribution.update(
    { status: 'failed' },
    { where: { groupId, userId: req.user.id, type: contributionType, month: contributionMonth, status: 'pending' } }
  );

  const reference = `coop_${contributionType}_${groupId}_${req.user.id}_${Date.now()}`;
  const amountInKobo = Math.round(Number(amount) * 100);

  const contribution = await Contribution.create({
    groupId,
    userId: req.user.id,
    amount,
    type: contributionType,
    month: contributionMonth,
    status: 'pending',
    reference,
  });

  const paystackData = await initializeTransaction({
    email: req.user.email,
    amount: amountInKobo,
    reference,
    callback_url: `${process.env.CLIENT_URL}/payment/callback`,
    metadata: { groupId, userId: req.user.id, type: contributionType, month: contributionMonth, contributionId: contribution.id },
  });

  res.status(201).json({
    authorizationUrl: paystackData.authorization_url,
    reference: paystackData.reference,
    amount: amountInKobo,
    email: req.user.email,
  });
});

// Called by the frontend callback page after Paystack redirects back
const verifyContribution = asyncHandler(async (req, res) => {
  const { reference } = req.params;

  const contribution = await Contribution.findOne({ where: { reference } });
  if (!contribution) {
    return res.status(404).json({ message: 'Contribution not found' });
  }

  if (contribution.userId !== req.user.id) {
    return res.status(403).json({ message: 'You cannot verify another member\'s payment' });
  }

  if (contribution.status === 'success') {
    return res.json(contribution);
  }

  const result = await verifyTransaction(reference);

  if (result.status === 'success') {
    await handleSuccessfulContribution(contribution, result.amount);
  } else if (result.status === 'failed') {
    contribution.status = 'failed';
    await contribution.save();
  }

  res.json(contribution);
});

// Paystack webhook — source of truth, works even if the user closes the browser
const paystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(req.rawBody)
    .digest('hex');

  if (hash !== signature) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    const contribution = await Contribution.findOne({ where: { reference } });
    if (contribution) {
      await handleSuccessfulContribution(contribution, event.data.amount);
    }
  }

  res.sendStatus(200);
});

// Logged-in user's contribution history for a specific group
const getGroupHistory = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const membership = await findMembership(groupId, req.user.id);
  if (!membership || membership.status === 'removed') {
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  const contributions = await Contribution.findAll({
    where: { groupId, userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });

  res.json(contributions);
});

const MANUAL_CHANNELS = ['bank_transfer', 'ussd', 'agent', 'cash'];

// Records a self-reported contribution via an offline channel (bank transfer,
// USSD, agent/POS deposit, or cash handed to a cooperative officer). Unlike
// the Paystack flow, there's no gateway to verify this against — so it stays
// "pending" until the group admin confirms it actually happened. Without that
// gate, any member could fabricate their own contribution history.
const initiateManualContribution = asyncHandler(async (req, res) => {
  const { groupId, month, type, channel, note } = req.body;
  const contributionType = type === 'registration' ? 'registration' : type === 'equity' ? 'equity' : 'monthly';

  if (!MANUAL_CHANNELS.includes(channel)) {
    return res.status(400).json({ message: `channel must be one of: ${MANUAL_CHANNELS.join(', ')}` });
  }

  const group = await Group.findByPk(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const membership = await findMembership(groupId, req.user.id);
  if (!membership || membership.status === 'removed') {
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  let amount;
  let contributionMonth = null;

  const alreadyPaidRegistration = await Contribution.findOne({
    where: { groupId, userId: req.user.id, type: 'registration', status: 'success' },
  });
  const alreadyPaidEquity = await Contribution.findOne({
    where: { groupId, userId: req.user.id, type: 'equity', status: 'success' },
  });

  if (contributionType === 'registration') {
    if (alreadyPaidRegistration) {
      return res.status(409).json({ message: 'You have already paid the registration fee for this group' });
    }
    amount = group.registrationFee;
  } else if (contributionType === 'equity') {
    if (alreadyPaidEquity) {
      return res.status(409).json({ message: 'You have already paid the equity share capital for this group' });
    }
    amount = group.equityAmount || 25000;
  } else {
    const hasReg = Number(group.registrationFee) === 0 || alreadyPaidRegistration;
    const hasEq = Number(group.equityAmount) === 0 || alreadyPaidEquity;
    if (!hasReg || !hasEq) {
      return res.status(403).json({ message: 'Pay your one-time onboarding fees before making monthly contributions' });
    }
    if (group.status !== 'active') {
      return res.status(403).json({ message: 'The group admin hasn\'t started this cooperative yet' });
    }
    contributionMonth = month || currentMonth();
    const alreadyPaid = await Contribution.findOne({
      where: { groupId, userId: req.user.id, month: contributionMonth, type: 'monthly', status: 'success' },
    });
    if (alreadyPaid) {
      return res.status(409).json({ message: `You have already paid for ${contributionMonth}` });
    }
    amount = group.monthlyAmount;
  }

  const reference = `manual_${channel}_${groupId}_${req.user.id}_${Date.now()}`;

  const contribution = await Contribution.create({
    groupId,
    userId: req.user.id,
    amount,
    type: contributionType,
    month: contributionMonth,
    status: 'success',
    paidAt: new Date(),
    reference,
    channel,
    channelNote: note || null,
  });

  // System auto-verifies payment instantly
  const expectedKobo = Math.round(Number(amount) * 100);
  await handleSuccessfulContribution(contribution, expectedKobo);

  let successMsg = `Payment of ₦${Number(amount).toLocaleString()} processed and verified successfully!`;
  if (contributionType === 'registration' || contributionType === 'equity') {
    successMsg += ' Your membership is now active.';
  }

  res.status(201).json({
    contribution,
    message: successMsg,
  });
});

// Admin's queue of self-reported contributions awaiting confirmation
const getPendingManualContributions = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const membership = await GroupMember.findOne({ where: { groupId, userId: req.user.id, status: 'active' } });
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ message: 'Only the group admin can review pending contributions' });
  }

  const pending = await Contribution.findAll({
    where: { groupId, status: 'pending', channel: MANUAL_CHANNELS },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    order: [['createdAt', 'DESC']],
  });

  res.json(pending);
});

// Admin confirms a self-reported contribution actually happened — this is the
// trust boundary: only after this does it count toward the treasury pool,
// registration activation, or the member's financial passport
const confirmManualContribution = asyncHandler(async (req, res) => {
  const { contributionId } = req.params;

  const contribution = await Contribution.findByPk(contributionId);
  if (!contribution || !MANUAL_CHANNELS.includes(contribution.channel)) {
    return res.status(404).json({ message: 'Contribution not found' });
  }

  const membership = await GroupMember.findOne({
    where: { groupId: contribution.groupId, userId: req.user.id, status: 'active' },
  });
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ message: 'Only the group admin can confirm contributions' });
  }

  if (contribution.status !== 'pending') {
    return res.status(409).json({ message: 'This contribution has already been resolved' });
  }

  const expectedKobo = Math.round(Number(contribution.amount) * 100);
  await handleSuccessfulContribution(contribution, expectedKobo);
  contribution.confirmedByUserId = req.user.id;
  await contribution.save();

  res.json(contribution);
});

const rejectManualContribution = asyncHandler(async (req, res) => {
  const { contributionId } = req.params;

  const contribution = await Contribution.findByPk(contributionId);
  if (!contribution || !MANUAL_CHANNELS.includes(contribution.channel)) {
    return res.status(404).json({ message: 'Contribution not found' });
  }

  const membership = await GroupMember.findOne({
    where: { groupId: contribution.groupId, userId: req.user.id, status: 'active' },
  });
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ message: 'Only the group admin can reject contributions' });
  }
  if (contribution.status !== 'pending') {
    return res.status(409).json({ message: 'This contribution has already been resolved' });
  }

  contribution.status = 'failed';
  contribution.confirmedByUserId = req.user.id;
  await contribution.save();

  res.json(contribution);
});

module.exports = {
  initiateContribution,
  verifyContribution,
  paystackWebhook,
  getGroupHistory,
  initiateManualContribution,
  getPendingManualContributions,
  confirmManualContribution,
  rejectManualContribution,
};
