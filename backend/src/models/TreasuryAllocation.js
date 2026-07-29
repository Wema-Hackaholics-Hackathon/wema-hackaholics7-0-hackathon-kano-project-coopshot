const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// One ledger row per monthly contribution: the 5% of that contribution
// earmarked for the group's connected treasury bill investment.
const TreasuryAllocation = sequelize.define('TreasuryAllocation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  contributionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  // The treasury bill product's rate at the time this allocation was made,
  // so past allocations keep accruing at the rate they were invested under.
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
}, {
  tableName: 'treasury_allocations',
  timestamps: true,
});

module.exports = TreasuryAllocation;
