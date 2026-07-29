const sequelize = require('../config/db');
const User = require('./User');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Contribution = require('./Contribution');
const TreasuryBill = require('./TreasuryBill');
const TreasuryAllocation = require('./TreasuryAllocation');
const TreasuryInvestment = require('./TreasuryInvestment');
const GroupInvite = require('./GroupInvite');
const GroupDocument = require('./GroupDocument');

// A user creates many groups; a group belongs to one creator
User.hasMany(Group, { foreignKey: 'createdBy', as: 'createdGroups' });
Group.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Membership: many-to-many between User and Group, through GroupMember
User.hasMany(GroupMember, { foreignKey: 'userId', as: 'memberships' });
GroupMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Group.hasMany(GroupMember, { foreignKey: 'groupId', as: 'members' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

// Contributions
User.hasMany(Contribution, { foreignKey: 'userId', as: 'contributions' });
Contribution.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Group.hasMany(Contribution, { foreignKey: 'groupId', as: 'contributions' });
Contribution.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

// Treasury bill: a group connects to one sandbox product
Group.belongsTo(TreasuryBill, { foreignKey: 'treasuryBillId', as: 'treasuryBill' });
TreasuryBill.hasMany(Group, { foreignKey: 'treasuryBillId', as: 'groups' });

// Treasury allocations: the 5%-of-contribution ledger
Group.hasMany(TreasuryAllocation, { foreignKey: 'groupId', as: 'treasuryAllocations' });
TreasuryAllocation.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

Contribution.hasOne(TreasuryAllocation, { foreignKey: 'contributionId', as: 'treasuryAllocation' });
TreasuryAllocation.belongsTo(Contribution, { foreignKey: 'contributionId', as: 'contribution' });

// Treasury investments: discrete "buy a treasury bill" cycles
Group.hasMany(TreasuryInvestment, { foreignKey: 'groupId', as: 'treasuryInvestments' });
TreasuryInvestment.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

TreasuryBill.hasMany(TreasuryInvestment, { foreignKey: 'treasuryBillId', as: 'investments' });
TreasuryInvestment.belongsTo(TreasuryBill, { foreignKey: 'treasuryBillId', as: 'treasuryBill' });

// Invites: a group sends targeted invites to specific email addresses
Group.hasMany(GroupInvite, { foreignKey: 'groupId', as: 'invites' });
GroupInvite.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

User.hasMany(GroupInvite, { foreignKey: 'invitedByUserId', as: 'sentInvites' });
GroupInvite.belongsTo(User, { foreignKey: 'invitedByUserId', as: 'invitedBy' });

// Documents: a group's uploaded constitution/registration files
Group.hasMany(GroupDocument, { foreignKey: 'groupId', as: 'documents' });
GroupDocument.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

User.hasMany(GroupDocument, { foreignKey: 'uploadedByUserId', as: 'uploadedDocuments' });
GroupDocument.belongsTo(User, { foreignKey: 'uploadedByUserId', as: 'uploadedBy' });

module.exports = {
  sequelize,
  User,
  Group,
  GroupMember,
  Contribution,
  TreasuryBill,
  TreasuryAllocation,
  TreasuryInvestment,
  GroupInvite,
  GroupDocument,
};
