const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  monthlyAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  // One-time fee a new member must pay before their membership becomes active
  registrationFee: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  inviteCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // "forming" = admin is still gathering participants, invite code works, no
  // monthly contributions yet. "active" = admin has started the group: invite
  // code stops working and monthly contributions open up.
  status: {
    type: DataTypes.ENUM('forming', 'active'),
    allowNull: false,
    defaultValue: 'forming',
  },
  // Sandbox FGN treasury bill product the admin has connected this group's treasury allocations to
  treasuryBillId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Uninvested cash sitting in the treasury pool — 5% cuts accumulate here until
  // the admin actually buys a treasury bill with it, and matured returns land back here
  treasuryPoolBalance: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  // Public societies are discoverable and joinable without an invite code
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // Flat fee charged when a member misses a monthly contribution (0 = disabled)
  lateFeeAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'groups',
  timestamps: true,
});

module.exports = Group;
