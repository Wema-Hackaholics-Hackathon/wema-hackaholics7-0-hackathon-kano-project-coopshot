const express = require('express');
const {
  initiateContribution,
  verifyContribution,
  paystackWebhook,
  getGroupHistory,
  initiateManualContribution,
  getPendingManualContributions,
  confirmManualContribution,
  rejectManualContribution,
} = require('../controllers/contributionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Webhook is called by Paystack directly, not the logged-in user — no auth middleware
router.post('/webhook', paystackWebhook);

router.use(protect);
router.post('/initiate', initiateContribution);
router.get('/verify/:reference', verifyContribution);
router.get('/history/:groupId', getGroupHistory);

router.post('/manual', initiateManualContribution);
router.get('/manual/group/:groupId/pending', getPendingManualContributions);
router.post('/manual/:contributionId/confirm', confirmManualContribution);
router.post('/manual/:contributionId/reject', rejectManualContribution);

module.exports = router;
