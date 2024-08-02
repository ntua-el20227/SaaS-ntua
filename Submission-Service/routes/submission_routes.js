const express = require('express');
const router = express.Router();
const SubmissionController = require('../controllers/submissionController');
const authenticateGoogleOAuth = require("../middleware/authentication");

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'Up and running!' });
});

router.get('/user/submissions',authenticateGoogleOAuth, SubmissionController.getUserSubmissions);
router.get('/user/submission/:SubmissionId' ,authenticateGoogleOAuth,SubmissionController.getUserDetailSubmissionById);
router.get('/allSubmissions',authenticateGoogleOAuth, SubmissionController.getAllSubmissions);

//return the top 10 users with the most submissions CK
router.get('/user/submissions/topusers', authenticateGoogleOAuth, SubmissionController.getTopUsers);

//return the number of total submissions CK
router.get('/user/submissions/total', authenticateGoogleOAuth, SubmissionController.getTotalSubmissions);

//return the per month number of submissions CK
router.get('/user/submissions/monthly', authenticateGoogleOAuth, SubmissionController.getSubmissionsPerMonth);



module.exports = router;