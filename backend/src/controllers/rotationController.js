const { Op } = require('sequelize');
const { Group, GroupMember, User, Contribution, RotationPayout } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

async function requireAdmin(groupId, userId) {
  const membership = await GroupMember.findOne({ where: { groupId, userId, status: 'active' } });
  return membership && membership.role === 'admin' ? membership : null;
}

// Rotation order is assigned once, the moment a group starts (join order at
// that instant) — membership is frozen from then on since invites/joins are
// already blocked once status !== 'forming'. This is a lazy safety net for
// groups that started before this feature existed; startGroup also calls it
// directly so newly-started groups get an order immediately.
async function ensureRotationPositions(groupId) {
  const alreadyAssigned = await GroupMember.count({
    where: { groupId, rotationPosition: { [Op.ne]: null } },
  });
  if (alreadyAssigned > 0) return;

  const members = await GroupMember.findAll({
    where: { groupId, status: 'active' },
    order: [['createdAt', 'ASC']],
  });
  await Promise.all(
    members.map((m, idx) => {
      m.rotationPosition = idx + 1;
      return m.save();
    })
  );
}

// The rotation queue: real payout order, whose turn is next, and this
// group's payout history so far. A group that hasn't started yet has no
// order — returned as an honest empty queue rather than an error.
const getRotationQueue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const membership = await GroupMember.findOne({
    where: { groupId: id, userId: req.user.id, status: { [Op.ne]: 'removed' } },
  });
  if (!membership) {
    return res.status(403).json({ message: 'You are not a member of this group' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (group.status !== 'active') {
    return res.json({
      queue: [],
      my_position: null,
      next_up: null,
      cycle: 'monthly',
      started: false,
      history: [],
    });
  }

  await ensureRotationPositions(id);

  const members = await GroupMember.findAll({
    where: { groupId: id, status: 'active', rotationPosition: { [Op.ne]: null } },
    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    order: [['rotationPosition', 'ASC']],
  });

  const payoutsMade = await RotationPayout.count({ where: { groupId: id } });
  const total = members.length;
  const nextIndex = total > 0 ? payoutsMade % total : null;

  const queue = members.map((m) => ({
    user_id: m.user.id,
    name: m.user.name,
    avatar_url: null,
    position: m.rotationPosition,
  }));

  const myEntry = members.find((m) => m.userId === req.user.id);
  const nextUp = nextIndex !== null ? queue[nextIndex] : null;

  const history = await RotationPayout.findAll({
    where: { groupId: id },
    include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
    order: [['month', 'DESC']],
  });

  res.json({
    queue,
    my_position: myEntry ? myEntry.rotationPosition : null,
    next_up: nextUp,
    cycle: 'monthly',
    started: true,
    history: history.map((h) => ({
      month: h.month,
      amount: Number(h.amount),
      user_id: h.userId,
      name: h.user?.name,
      distributed_at: h.createdAt,
    })),
  });
});

// Admin-triggered: pay out this month's actually-collected pot (sum of this
// month's successful monthly contributions — not a theoretical projection)
// to whoever is next in the queue. One payout per group per month.
const distributeRotationPayout = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!(await requireAdmin(id, req.user.id))) {
    return res.status(403).json({ message: 'Only the group admin can distribute the rotation payout' });
  }

  const group = await Group.findByPk(id);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }
  if (group.status !== 'active') {
    return res.status(403).json({ message: 'This group has not started yet — there is no rotation order to pay out' });
  }

  const month = currentMonth();

  const existing = await RotationPayout.findOne({ where: { groupId: id, month } });
  if (existing) {
    return res.status(409).json({ message: "This month's rotation payout has already been distributed" });
  }

  await ensureRotationPositions(id);

  const members = await GroupMember.findAll({
    where: { groupId: id, status: 'active', rotationPosition: { [Op.ne]: null } },
    order: [['rotationPosition', 'ASC']],
  });
  if (members.length === 0) {
    return res.status(400).json({ message: 'No rotation order has been assigned for this group' });
  }

  const payoutsMade = await RotationPayout.count({ where: { groupId: id } });
  const recipient = members[payoutsMade % members.length];

  const contributions = await Contribution.findAll({
    where: { groupId: id, month, type: 'monthly', status: 'success' },
  });
  const pot = contributions.reduce((sum, c) => sum + Number(c.amount), 0);

  if (pot <= 0) {
    return res.status(400).json({ message: 'No successful contributions have been collected for this month yet' });
  }

  const payout = await RotationPayout.create({
    groupId: id,
    userId: recipient.userId,
    month,
    amount: pot,
  });

  res.status(201).json(payout);
});

module.exports = { getRotationQueue, distributeRotationPayout, ensureRotationPositions };
