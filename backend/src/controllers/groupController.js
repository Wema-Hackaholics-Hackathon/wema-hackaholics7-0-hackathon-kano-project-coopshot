const { Op } = require('sequelize');
const { Group, GroupMember, Contribution, User, sequelize } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const generateInviteCode = require('../utils/inviteCode');
const { computeLoanEligibility } = require('../utils/loanEligibility');
const { ensureRotationPositions } = require('./rotationController');

function currentMonth() {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

// Create a group; creator is automatically added as an admin member.
// Admins don't pay their own group's registration fee — they founded it.
const createGroup = asyncHandler(async (req, res) => {
  const { name, description, monthlyAmount, registrationFee } = req.body;

  if (!name || !monthlyAmount || registrationFee === undefined || registrationFee === '') {
    return res.status(400).json({ message: 'Group name, monthly amount and registration fee are required' });
  }

  if (!(Number(monthlyAmount) > 0) || !(Number(registrationFee) >= 0)) {
    return res.status(400).json({ message: 'Monthly amount must be greater than 0 and registration fee cannot be negative' });
  }

  const result = await sequelize.transaction(async (t) => {
    let inviteCode;
    let isUnique = false;
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existing = await Group.findOne({ where: { inviteCode }, transaction: t });
      if (!existing) isUnique = true;
    }

    const group = await Group.create({
      name,
      description,
      monthlyAmount,
      registrationFee,
      inviteCode,
      createdBy: req.user.id,
    }, { transaction: t });

    await GroupMember.create({
      groupId: group.id,
      userId: req.user.id,
      role: 'admin',
      status: 'active',
    }, { transaction: t });

    return group;
  });

  res.status(201).json(result);
});

// List groups the logged-in user belongs to (including ones awaiting registration payment)
const getMyGroups = asyncHandler(async (req, res) => {
  const memberships = await GroupMember.findAll({
    where: { userId: req.user.id, status: { [Op.ne]: 'removed' } },
    include: [{ model: Group, as: 'group' }],
  });

  const memberCounts = memberships.length
    ? await GroupMember.findAll({
        where: { groupId: memberships.map((m) => m.groupId), status: 'active' },
        attributes: ['groupId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['groupId'],
        raw: true,
      })
    : [];
  const countByGroupId = new Map(memberCounts.map((c) => [c.groupId, Number(c.count)]));

  const groups = memberships.map((m) => ({
    ...m.group.toJSON(),
    myRole: m.role,
    membershipStatus: m.status,
    memberCount: countByGroupId.get(m.groupId) || 0,
  }));

  res.json(groups);
});

// Join a group via invite code. If the group has a registration fee, membership
// starts "pending" until that one-time fee is paid.
const joinGroup = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    return res.status(400).json({ message: 'Invite code is required' });
  }

  const group = await Group.findOne({ where: { inviteCode: inviteCode.toUpperCase() } });
  if (!group) {
    return res.status(404).json({ message: 'No group found with that invite code' });
  }

  const initialStatus = Number(group.registrationFee) > 0 ? 'pending' : 'active';

  const existingMembership = await GroupMember.findOne({
    where: { groupId: group.id, userId: req.user.id },
  });

  if (existingMembership) {
    if (existingMembership.status === 'active') {
      return res.status(409).json({ message: 'You are already a member of this group' });
    }
    if (existingMembership.status === 'pending') {
      return res.status(200).json({ ...group.toJSON(), membershipStatus: 'pending' });
    }
    // was previously removed — rejoining counts as a new participant
    if (group.status !== 'forming') {
      return res.status(403).json({ message: 'This cooperative has already started and is no longer accepting new members' });
    }
    existingMembership.status = initialStatus;
    await existingMembership.save();
    return res.json({ ...group.toJSON(), membershipStatus: initialStatus });
  }

  if (group.status !== 'forming') {
    return res.status(403).json({ message: 'This cooperative has already started and is no longer accepting new members' });
  }

  await GroupMember.create({
    groupId: group.id,
    userId: req.user.id,
    role: 'member',
    status: initialStatus,
  });

  res.status(201).json({ ...group.toJSON(), membershipStatus: initialStatus });
});

// Admin action: lock in the participant list and open up monthly contributions.
// Irreversible — once started, the invite code stops admitting new members.
const startGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const membership = await GroupMember.findOne({
    where: { groupId: id, userId: req.user.id, status: 'active' },
  });
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ message: 'Only the group admin can start the group' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  if (group.status === 'active') {
    return res.status(409).json({ message: 'This group has already started' });
  }

  group.status = 'active';
  await group.save();

  // Assign the permanent rotation payout order now — join order is frozen
  // from this point since invites/joins are already blocked once status
  // leaves "forming".
  await ensureRotationPositions(id);

  res.json(group);
});

// Get a single group's detail. Members who haven't paid their registration fee yet
// get a limited payload (just enough to complete that payment); active members and
// admins get the full roster and this month's contribution status.
const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findByPk(req.params.id, {
    include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
  });

  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const membership = await GroupMember.findOne({
    where: { groupId: group.id, userId: req.user.id, status: { [Op.ne]: 'removed' } },
  });

  const activeMembers = await GroupMember.findAll({
    where: { groupId: group.id, status: 'active' },
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
  });

  const memberList = activeMembers.map((m) => ({
    userId: m.user.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    joinedAt: m.createdAt,
  }));

  if (!membership) {
    if (group.isPublic) {
      return res.json({
        id: group.id,
        name: group.name,
        description: group.description,
        avatarUrl: group.avatarUrl,
        monthlyAmount: group.monthlyAmount,
        registrationFee: group.registrationFee,
        equityAmount: group.equityAmount,
        loanMultiplier: group.loanMultiplier,
        status: group.status,
        isPublic: group.isPublic,
        memberCount: activeMembers.length,
        myRole: null,
        membershipStatus: 'none',
        creator: group.creator,
        members: memberList,
      });
    }
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  const paidContributions = await Contribution.findAll({
    where: { groupId: group.id, userId: req.user.id, status: { [Op.ne]: 'failed' } },
    attributes: ['type'],
  });
  const paidTypes = new Set(paidContributions.map((c) => c.type));

  const hasPaidRegistration = Number(group.registrationFee) === 0 || paidTypes.has('registration');
  const hasPaidEquity = Number(group.equityAmount) === 0 || paidTypes.has('equity');

  if (membership.status === 'pending' || !hasPaidRegistration || !hasPaidEquity) {
    return res.json({
      id: group.id,
      name: group.name,
      description: group.description,
      avatarUrl: group.avatarUrl,
      monthlyAmount: group.monthlyAmount,
      registrationFee: group.registrationFee,
      equityAmount: group.equityAmount,
      loanMultiplier: group.loanMultiplier,
      status: group.status,
      isPublic: group.isPublic,
      memberCount: activeMembers.length,
      myRole: membership.role,
      membershipStatus: (hasPaidRegistration && hasPaidEquity) ? 'active' : 'pending',
      hasPaidRegistration,
      hasPaidEquity,
      creator: group.creator,
      members: memberList,
    });
  }

  const month = req.query.month || currentMonth();

  const contributions = await Contribution.findAll({
    where: { groupId: group.id, month, type: 'monthly', status: 'success' },
  });
  const paidUserIds = new Set(contributions.map((c) => c.userId));

  const memberListWithPaid = memberList.map((m) => ({
    ...m,
    hasPaidThisMonth: paidUserIds.has(m.userId),
  }));

  const totalCollected = contributions.reduce((sum, c) => sum + Number(c.amount), 0);

  const { myTotalContributed, myMaxLoanAmount } = await computeLoanEligibility(group, req.user.id);

  res.json({
    ...group.toJSON(),
    myRole: membership.role,
    membershipStatus: 'active',
    hasPaidRegistration,
    hasPaidEquity,
    month,
    members: memberListWithPaid,
    totalCollected,
    totalExpected: Number(group.monthlyAmount) * memberListWithPaid.length,
    myTotalContributed,
    myMaxLoanAmount,
  });
});

async function requireAdmin(groupId, userId) {
  const membership = await GroupMember.findOne({ where: { groupId, userId, status: 'active' } });
  return membership && membership.role === 'admin' ? membership : null;
}

// Admin updates group settings. Monthly amount / registration fee can only
// change while still "forming" — changing the deal mid-cycle on members who
// already joined under the old terms would be unfair. Visibility and the
// late-fee amount can be changed anytime.
const updateGroupSettings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!(await requireAdmin(id, req.user.id))) {
    return res.status(403).json({ message: 'Only the group admin can update settings' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  const { monthlyAmount, registrationFee, isPublic, lateFeeAmount, loanMultiplier } = req.body;

  if (monthlyAmount !== undefined || registrationFee !== undefined) {
    if (group.status !== 'forming') {
      return res.status(403).json({ message: 'Monthly amount and registration fee can only be changed before the group starts' });
    }
    if (monthlyAmount !== undefined) {
      if (!(Number(monthlyAmount) > 0)) {
        return res.status(400).json({ message: 'Monthly amount must be greater than 0' });
      }
      group.monthlyAmount = monthlyAmount;
    }
    if (registrationFee !== undefined) {
      if (!(Number(registrationFee) >= 0)) {
        return res.status(400).json({ message: 'Registration fee cannot be negative' });
      }
      group.registrationFee = registrationFee;
    }
  }

  if (isPublic !== undefined) group.isPublic = !!isPublic;
  if (lateFeeAmount !== undefined) {
    if (!(Number(lateFeeAmount) >= 0)) {
      return res.status(400).json({ message: 'Late fee cannot be negative' });
    }
    group.lateFeeAmount = lateFeeAmount;
  }
  if (loanMultiplier !== undefined) {
    const parsedMultiplier = Number(loanMultiplier);
    if (!Number.isInteger(parsedMultiplier) || parsedMultiplier < 1 || parsedMultiplier > 5) {
      return res.status(400).json({ message: 'Loan multiplier must be a whole number between x1 and x5' });
    }
    group.loanMultiplier = parsedMultiplier;
  }

  await group.save();
  res.json(group);
});

const toggleGroupVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isPublic } = req.body;

  if (!(await requireAdmin(id, req.user.id))) {
    return res.status(403).json({ message: 'Only the group admin can change visibility' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  group.isPublic = !!isPublic;
  await group.save();

  res.json({ success: true, isPublic: group.isPublic });
});

const uploadGroupAvatar = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!(await requireAdmin(id, req.user.id))) {
    return res.status(403).json({ message: 'Only the group admin can update the avatar' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'An image file is required' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  group.avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await group.save();

  res.json({ avatarUrl: group.avatarUrl });
});

module.exports = {
  createGroup,
  getMyGroups,
  joinGroup,
  getGroupById,
  startGroup,
  updateGroupSettings,
  toggleGroupVisibility,
  uploadGroupAvatar,
};
