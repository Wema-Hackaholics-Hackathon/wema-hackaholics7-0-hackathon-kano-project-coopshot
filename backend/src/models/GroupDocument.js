const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const GroupDocument = sequelize.define('GroupDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uploadedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Documents are auto-approved for now — no separate platform-review workflow exists
  approved: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'group_documents',
  timestamps: true,
});

module.exports = GroupDocument;
