const { Group, GroupMember, GroupDocument } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

async function requireAdmin(groupId, userId) {
  const membership = await GroupMember.findOne({ where: { groupId, userId, status: 'active' } });
  return membership && membership.role === 'admin';
}

const listDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const membership = await GroupMember.findOne({ where: { groupId: id, userId: req.user.id, status: 'active' } });
  if (!membership) {
    return res.status(403).json({ message: 'You are not an active member of this group' });
  }

  const documents = await GroupDocument.findAll({ where: { groupId: id }, order: [['createdAt', 'DESC']] });
  res.json(documents);
});

const uploadDocument = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, description } = req.body;

  if (!(await requireAdmin(id, req.user.id))) {
    return res.status(403).json({ message: 'Only the group admin can upload documents' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'A file is required' });
  }
  if (!type) {
    return res.status(400).json({ message: 'Document type is required' });
  }

  const document = await GroupDocument.create({
    groupId: id,
    type,
    description: description || null,
    fileUrl: `/uploads/documents/${req.file.filename}`,
    uploadedByUserId: req.user.id,
  });

  res.status(201).json(document);
});

module.exports = { listDocuments, uploadDocument };
