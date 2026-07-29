const express = require('express');
const { getMyPendingInvites, acceptInvite, declineInvite } = require('../controllers/inviteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getMyPendingInvites);
router.post('/:id/accept', acceptInvite);
router.post('/:id/decline', declineInvite);

module.exports = router;
