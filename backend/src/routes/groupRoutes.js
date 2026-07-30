const express = require('express');
const {
  createGroup,
  getMyGroups,
  joinGroup,
  getGroupById,
  startGroup,
  updateGroupSettings,
  toggleGroupVisibility,
  uploadGroupAvatar,
} = require('../controllers/groupController');
const {
  getPublicGroups,
  getRecommendedGroups,
  joinPublicGroup,
} = require('../controllers/discoveryController');
const { inviteToGroup } = require('../controllers/inviteController');
const { getGroupLedger, getNextDueDate, getMyPenalties } = require('../controllers/ledgerController');
const { listDocuments, uploadDocument } = require('../controllers/documentController');
const { requestLoan, getMyLoans, getGroupLoans, decideLoan } = require('../controllers/loanController');
const { getRotationQueue, distributeRotationPayout } = require('../controllers/rotationController');
const { protect } = require('../middleware/auth');
const { avatarUpload, documentUpload } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

// Discovery routes must come before "/:id" so "public"/"recommended" aren't
// swallowed as an :id value
router.get('/public', getPublicGroups);
router.get('/recommended', getRecommendedGroups);
router.post('/:id/join-public', joinPublicGroup);

router.post('/', createGroup);
router.get('/', getMyGroups);
router.post('/join', joinGroup);
router.get('/:id', getGroupById);
router.post('/:id/start', startGroup);
router.patch('/:id/settings', updateGroupSettings);
router.patch('/:id/visibility', toggleGroupVisibility);
router.post('/:id/avatar', avatarUpload.single('avatar'), uploadGroupAvatar);

router.get('/:id/documents', listDocuments);
router.post('/:id/documents', documentUpload.single('file'), uploadDocument);

router.post('/:id/invites', inviteToGroup);

router.get('/:id/ledger', getGroupLedger);
router.get('/:id/next-due', getNextDueDate);
router.get('/:id/penalties', getMyPenalties);

router.post('/:id/loans', requestLoan);
router.get('/:id/loans/mine', getMyLoans);
router.get('/:id/loans', getGroupLoans);
router.patch('/:id/loans/:loanId/decision', decideLoan);

router.get('/:id/rotation', getRotationQueue);
router.post('/:id/rotation/distribute', distributeRotationPayout);

module.exports = router;
