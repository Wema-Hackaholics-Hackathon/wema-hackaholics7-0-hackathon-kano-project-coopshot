const { GroupMember, Group, Contribution, TreasuryAllocation, TreasuryInvestment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

function monthsBetween(start, end) {
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  return Math.max(months, 1);
}

function scoreLabel(score) {
  if (score >= 85) return 'Trusted Community Member';
  if (score >= 60) return 'Building Trust';
  if (score > 0) return 'New Member';
  return 'No Financial History Yet';
}

// A portable record of a member's verified financial participation, built entirely
// from their real contribution history — not a generic credit score.
const getMyPassport = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const memberships = await GroupMember.findAll({
    where: { userId },
    include: [{ model: Group, as: 'group' }],
  });

  const activeMemberships = memberships.filter((m) => m.status !== 'removed');
  const cooperativesJoined = activeMemberships.length;

  const contributions = await Contribution.findAll({
    where: { userId },
    include: [{ model: TreasuryAllocation, as: 'treasuryAllocation' }],
  });

  const successfulMonthly = contributions.filter((c) => c.type === 'monthly' && c.status === 'success');
  const successfulRegistration = contributions.filter((c) => c.type === 'registration' && c.status === 'success');
  const failedAny = contributions.filter((c) => c.status === 'failed');

  const totalContributed = successfulMonthly.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalRegistrationFeesPaid = successfulRegistration.reduce((sum, c) => sum + Number(c.amount), 0);
  const totalInvestmentAllocated = successfulMonthly.reduce(
    (sum, c) => sum + (c.treasuryAllocation ? Number(c.treasuryAllocation.amount) : 0),
    0
  );

  // Consistency: of the months since each membership became active, how many
  // were actually paid for? membership.updatedAt is used as the activation
  // timestamp — it only changes when a pending membership flips to active.
  let consistency = 0;
  if (activeMemberships.length > 0) {
    const now = new Date();
    const ratios = activeMemberships
      .filter((m) => m.status === 'active')
      .map((m) => {
        const activatedAt = new Date(m.updatedAt);
        const expected = monthsBetween(activatedAt, now);
        const paidMonths = new Set(
          successfulMonthly.filter((c) => c.groupId === m.groupId).map((c) => c.month)
        ).size;
        return Math.min(paidMonths / expected, 1);
      });
    consistency = ratios.length > 0 ? (ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100 : 0;
  }

  // Payment reliability: of every payment ever attempted (registration or monthly),
  // what fraction actually succeeded?
  const successfulCount = successfulMonthly.length + successfulRegistration.length;
  const attemptedCount = successfulCount + failedAny.length;
  const paymentReliability = attemptedCount > 0 ? (successfulCount / attemptedCount) * 100 : 0;

  // Investment participation: of every naira contributed monthly, how much landed
  // in a period where the group had an active treasury bill connection?
  const investedContributions = successfulMonthly.filter(
    (c) => c.treasuryAllocation && Number(c.treasuryAllocation.interestRate) > 0
  );
  const investedAmount = investedContributions.reduce((sum, c) => sum + Number(c.amount), 0);
  const investmentParticipation = totalContributed > 0 ? (investedAmount / totalContributed) * 100 : 0;

  // Discipline: of every successful monthly contribution, what fraction was
  // paid in the first half of its target month (days 1-15) rather than the
  // back half? A genuinely distinct signal from consistency (which only
  // checks whether a month was paid at all, not when).
  let discipline = 0;
  if (successfulMonthly.length > 0) {
    const early = successfulMonthly.filter((c) => c.paidAt && new Date(c.paidAt).getDate() <= 15).length;
    discipline = (early / successfulMonthly.length) * 100;
  }

  // Completed investment cycles and this member's share of the returns they
  // generated. Treasury investments pool every member's allocations together
  // — there's no ledger of which specific allocation funded which specific
  // cycle — so a member's return share is approximated as their proportion
  // of that group's total-ever allocations, applied to the group's total
  // matured returns. Cycles counted are ones that matured after this member
  // became active in that group.
  let completedCycles = 0;
  let totalInvestmentReturns = 0;

  for (const membership of activeMemberships.filter((m) => m.status === 'active')) {
    const groupAllocations = await TreasuryAllocation.findAll({ where: { groupId: membership.groupId } });
    const groupTotalAllocated = groupAllocations.reduce((sum, a) => sum + Number(a.amount), 0);

    const myAllocated = successfulMonthly
      .filter((c) => c.groupId === membership.groupId)
      .reduce((sum, c) => sum + (c.treasuryAllocation ? Number(c.treasuryAllocation.amount) : 0), 0);

    const myShare = groupTotalAllocated > 0 ? myAllocated / groupTotalAllocated : 0;

    const maturedInvestments = await TreasuryInvestment.findAll({
      where: { groupId: membership.groupId, status: 'matured' },
    });

    const activatedAt = new Date(membership.updatedAt);
    for (const inv of maturedInvestments) {
      if (new Date(inv.purchasedAt) >= activatedAt) {
        completedCycles += 1;
        totalInvestmentReturns += Number(inv.returnAmount) * myShare;
      }
    }
  }

  const components = [consistency, paymentReliability, investmentParticipation];
  const overallScore = attemptedCount > 0 || totalContributed > 0
    ? components.reduce((a, b) => a + b, 0) / components.length
    : 0;

  const distinctMonthsPaid = new Set(successfulMonthly.map((c) => `${c.groupId}-${c.month}`)).size;

  const memberSince = activeMemberships.length > 0
    ? activeMemberships.reduce((earliest, m) => (m.createdAt < earliest ? m.createdAt : earliest), activeMemberships[0].createdAt)
    : null;

  const journey = [
    { key: 'joined', label: 'Joined a cooperative', achieved: cooperativesJoined > 0, locked: false },
    { key: 'registered', label: 'Paid registration fee', achieved: successfulRegistration.length > 0, locked: false },
    { key: 'consistent', label: '3+ months of consistent contributions', achieved: distinctMonthsPaid >= 3, locked: false },
    { key: 'invested', label: 'Completed an investment cycle', achieved: investedAmount > 0, locked: false },
    { key: 'credit', label: 'Eligible for cooperative credit', achieved: false, locked: true },
    { key: 'protection', label: 'Unlock business protection', achieved: false, locked: true },
  ];

  res.json({
    identity: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
    },
    memberSince,
    cooperativesJoined,
    totalContributed,
    totalRegistrationFeesPaid,
    totalInvestmentAllocated,
    totalInvestmentReturns,
    completedCycles,
    trustProfile: {
      consistency: Math.round(consistency),
      paymentReliability: Math.round(paymentReliability),
      investmentParticipation: Math.round(investmentParticipation),
      discipline: Math.round(discipline),
      overallScore: Math.round(overallScore),
      label: scoreLabel(overallScore),
    },
    journey,
  });
});

module.exports = { getMyPassport };
