const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// One record per cycle a group's pooled monthly contributions were paid out
// to whoever was next in the rotation queue. Unique per (groupId, month) —
// a group can only distribute one rotation payout per month.
const RotationPayout = sequelize.define('RotationPayout', {
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
  month: {
    type: DataTypes.STRING, // 'YYYY-MM'
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
}, {
  tableName: 'rotation_payouts',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['groupId', 'month'] },
  ],
});

module.exports = RotationPayout;
