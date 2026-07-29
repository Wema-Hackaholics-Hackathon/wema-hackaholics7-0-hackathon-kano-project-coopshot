const { Op } = require('sequelize');
const { Group, GroupMember } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

const PAGE_SIZE = 6;

async function memberCounts(groupIds) {
  const rows = await GroupMember.findAll({
    where: { groupId: groupIds, status: 'active' },
    attributes: ['groupId'],
  });
  const counts = {};
  rows.forEach((r) => { counts[r.groupId] = (counts[r.groupId] || 0) + 1; });
  return counts;
}

function serialize(group, counts) {
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    avatarUrl: group.avatarUrl,
    monthlyAmount: group.monthlyAmount,
    registrationFee: group.registrationFee,
    memberCount: counts[group.id] || 0,
    status: group.status,
    createdAt: group.createdAt,
  };
}

// Public societies: browsable/searchable, joinable without an invite code
const getPublicGroups = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const search = (req.query.search || '').trim();

  const where = { isPublic: true };
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Group.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const counts = await memberCounts(rows.map((g) => g.id));

  res.json({
    data: rows.map((g) => serialize(g, counts)),
    current_page: page,
    last_page: Math.max(1, Math.ceil(count / PAGE_SIZE)),
    total: count,
  });
});

// Recommended: public societies the user hasn't already joined
const getRecommendedGroups = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);

  const myMemberships = await GroupMember.findAll({
    where: { userId: req.user.id, status: { [Op.ne]: 'removed' } },
    attributes: ['groupId'],
  });
  const excludeIds = myMemberships.map((m) => m.groupId);

  const where = { isPublic: true };
  if (excludeIds.length > 0) {
    where.id = { [Op.notIn]: excludeIds };
  }

  const { rows, count } = await Group.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const counts = await memberCounts(rows.map((g) => g.id));

  res.json({
    data: rows.map((g) => serialize(g, counts)),
    current_page: page,
    last_page: Math.max(1, Math.ceil(count / PAGE_SIZE)),
    total: count,
  });
});

// Join a public society directly, no invite code needed
const joinPublicGroup = asyncHandler(async (req, res) => {
  const group = await Group.findByPk(req.params.id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  if (!group.isPublic) {
    return res.status(403).json({ message: 'This group is not public — you need an invite code to join' });
  }
  if (group.status !== 'forming') {
    return res.status(403).json({ message: 'This cooperative has already started and is no longer accepting new members' });
  }

  const initialStatus = Number(group.registrationFee) > 0 ? 'pending' : 'active';

  const existing = await GroupMember.findOne({ where: { groupId: group.id, userId: req.user.id } });
  if (existing) {
    if (existing.status === 'active') {
      return res.status(409).json({ message: 'You are already a member of this group' });
    }
    if (existing.status === 'pending') {
      return res.status(200).json({ ...group.toJSON(), membershipStatus: 'pending' });
    }
    existing.status = initialStatus;
    await existing.save();
    return res.json({ ...group.toJSON(), membershipStatus: initialStatus });
  }

  await GroupMember.create({ groupId: group.id, userId: req.user.id, role: 'member', status: initialStatus });
  res.status(201).json({ ...group.toJSON(), membershipStatus: initialStatus });
});

module.exports = { getPublicGroups, getRecommendedGroups, joinPublicGroup };
