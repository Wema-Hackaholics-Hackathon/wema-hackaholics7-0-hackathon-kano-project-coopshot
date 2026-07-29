const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GroupMember = sequelize.define('GroupMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    allowNull: false,
    defaultValue: 'member',
  },
  // "pending" = joined but hasn't paid the group's one-time registration fee yet
  status: {
    type: DataTypes.ENUM('pending', 'active', 'removed'),
    allowNull: false,
    defaultValue: 'active',
  },
}, {
  tableName: 'group_members',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['groupId', 'userId'] },
  ],
});

module.exports = GroupMember;
