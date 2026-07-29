const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Sandbox catalog of FGN (Federal Government of Nigeria) treasury bill products.
// This is simulated/demo data — there is no real public money-market API being called.
const TreasuryBill = sequelize.define('TreasuryBill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tenorDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Annual interest rate, e.g. 18.50 means 18.5% p.a.
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Sandbox Money Market API',
  },
}, {
  tableName: 'treasury_bills',
  timestamps: true,
});

module.exports = TreasuryBill;
