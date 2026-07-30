const { Op } = require('sequelize');
const { Contribution } = require('../models');

// A member's max loan = group.loanMultiplier x their total equity + monthly
// contributions to that group. Shared between the group detail endpoint
// (display) and the loan request endpoint (server-side enforcement) so the
// two never drift apart.
async function computeLoanEligibility(group, userId) {
  const contributions = await Contribution.findAll({
    where: { groupId: group.id, userId, type: { [Op.in]: ['equity', 'monthly'] }, status: 'success' },
  });
  const myTotalContributed = contributions.reduce((sum, c) => sum + Number(c.amount), 0);
  const myMaxLoanAmount = myTotalContributed * Number(group.loanMultiplier);
  return { myTotalContributed, myMaxLoanAmount };
}

module.exports = { computeLoanEligibility };
