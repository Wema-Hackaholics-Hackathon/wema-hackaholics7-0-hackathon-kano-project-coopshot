const express = require('express');
const {
  listTreasuryBills,
  connectTreasuryBill,
  investPoolBalance,
  distributeInvestmentReturns,
  getGroupTreasurySummary,
} = require('../controllers/treasuryController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/treasury-bills', listTreasuryBills);
router.post('/groups/:id/treasury-bill', connectTreasuryBill);
router.get('/groups/:id/treasury', getGroupTreasurySummary);
router.post('/groups/:id/treasury/invest', investPoolBalance);
router.post('/groups/:id/treasury/investments/:investmentId/distribute', distributeInvestmentReturns);

module.exports = router;
