const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// A targeted invite to a specific email address — distinct from the open
// invite-code join flow. Used for "invite a co-founder" (role: admin) and
// "invite a member" (role: member).
const GroupInvite = sequelize.define('GroupInvite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  invitedEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  invitedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    allowNull: false,
    defaultValue: 'member',
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  tableName: 'group_invites',
  timestamps: true,
});

module.exports = GroupInvite;
