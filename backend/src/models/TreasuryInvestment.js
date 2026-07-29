const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// A single "buy a treasury bill" cycle: the admin sweeps the group's pool balance
// into a sandbox FGN treasury bill product, it accrues until maturity, then the
// admin distributes principal + interest back into the pool.
const TreasuryInvestment = sequelize.define('TreasuryInvestment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  treasuryBillId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  principal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  // Rate and tenor are copied from the product at purchase time so this cycle's
  // math doesn't change if the admin later connects a different product
  interestRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
  },
  tenorDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  purchasedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  maturityDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'matured'),
    allowNull: false,
    defaultValue: 'active',
  },
  returnAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  distributedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'treasury_investments',
  timestamps: true,
});

module.exports = TreasuryInvestment;
