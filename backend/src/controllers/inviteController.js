const { Op } = require('sequelize');
const { Group, GroupMember, GroupInvite, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// Admin sends a targeted invite to a specific email — role 'admin' is asusu's
// "co-founder" concept, reusing the existing admin/member role split rather
// than adding a third tier
const inviteToGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  const inviteRole = role === 'admin' ? 'admin' : 'member';

  const membership = await GroupMember.findOne({ where: { groupId: id, userId: req.user.id, status: 'active' } });
  if (!membership || membership.role !== 'admin') {
    return res.status(403).json({ message: 'Only the group admin can send invites' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  if (group.status !== 'forming') {
    return res.status(403).json({ message: 'This cooperative has already started and is no longer accepting new members' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingInvite = await GroupInvite.findOne({
    where: { groupId: id, invitedEmail: normalizedEmail, status: 'pending' },
  });
  if (existingInvite) {
    return res.status(409).json({ message: 'An invite to this email is already pending' });
  }

  const invite = await GroupInvite.create({
    groupId: id,
    invitedEmail: normalizedEmail,
    invitedByUserId: req.user.id,
    role: inviteRole,
  });

  res.status(201).json(invite);
});

// Pending invites addressed to the logged-in user's own email
const getMyPendingInvites = asyncHandler(async (req, res) => {
  const invites = await GroupInvite.findAll({
    where: { invitedEmail: req.user.email.toLowerCase(), status: 'pending' },
    include: [
      { model: Group, as: 'group' },
      { model: User, as: 'invitedBy', attributes: ['id', 'name', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  res.json({ data: invites, total: invites.length });
});

const acceptInvite = asyncHandler(async (req, res) => {
  const invite = await GroupInvite.findByPk(req.params.id, { include: [{ model: Group, as: 'group' }] });
  if (!invite || invite.invitedEmail !== req.user.email.toLowerCase()) {
    return res.status(404).json({ message: 'Invite not found' });
  }
  if (invite.status !== 'pending') {
    return res.status(409).json({ message: 'This invite has already been responded to' });
  }
  if (invite.group.status !== 'forming') {
    return res.status(403).json({ message: 'This cooperative has already started and is no longer accepting new members' });
  }

  const initialStatus = Number(invite.group.registrationFee) > 0 ? 'pending' : 'active';

  const existingMembership = await GroupMember.findOne({ where: { groupId: invite.groupId, userId: req.user.id } });
  if (existingMembership) {
    if (existingMembership.status === 'removed') {
      existingMembership.status = initialStatus;
      existingMembership.role = invite.role;
      await existingMembership.save();
    }
  } else {
    await GroupMember.create({ groupId: invite.groupId, userId: req.user.id, role: invite.role, status: initialStatus });
  }

  invite.status = 'accepted';
  await invite.save();

  res.json({ success: true, groupId: invite.groupId, membershipStatus: initialStatus });
});

const declineInvite = asyncHandler(async (req, res) => {
  const invite = await GroupInvite.findByPk(req.params.id);
  if (!invite || invite.invitedEmail !== req.user.email.toLowerCase()) {
    return res.status(404).json({ message: 'Invite not found' });
  }
  if (invite.status !== 'pending') {
    return res.status(409).json({ message: 'This invite has already been responded to' });
  }

  invite.status = 'declined';
  await invite.save();

  res.json({ success: true });
});

module.exports = { inviteToGroup, getMyPendingInvites, acceptInvite, declineInvite };
