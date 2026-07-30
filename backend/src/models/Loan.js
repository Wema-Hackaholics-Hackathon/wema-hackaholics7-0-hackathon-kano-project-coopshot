const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// A member's request to borrow against their contributions, capped by the
// group's loanMultiplier at request time. No disbursement/repayment tracking
// yet — this only covers the request -> admin decision step.
const Loan = sequelize.define('Loan', {
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
  // Snapshot of (loanMultiplier x member's total contributions) at request
  // time, kept for audit even if the member's contributions or the group's
  // multiplier change later.
  eligibleAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  },
  decidedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  decidedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  decisionNote: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'loans',
  timestamps: true,
});

module.exports = Loan;
