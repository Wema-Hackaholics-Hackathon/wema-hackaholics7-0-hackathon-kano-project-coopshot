const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Contribution = sequelize.define('Contribution', {
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
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  // "registration" = one-time joining fee, "monthly" = regular monthly contribution
  type: {
    type: DataTypes.ENUM('registration', 'monthly'),
    allowNull: false,
    defaultValue: 'monthly',
  },
  // Contribution period this payment covers, e.g. "2026-07" — null for registration fees
  month: {
    type: DataTypes.STRING(7),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // "paystack" is verified automatically; the others are self-reported and
  // stay "pending" until the group admin confirms them — otherwise any
  // member could fabricate their own contribution history
  channel: {
    type: DataTypes.ENUM('paystack', 'bank_transfer', 'ussd', 'agent', 'cash'),
    allowNull: false,
    defaultValue: 'paystack',
  },
  channelNote: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  confirmedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'contributions',
  timestamps: true,
});

module.exports = Contribution;
