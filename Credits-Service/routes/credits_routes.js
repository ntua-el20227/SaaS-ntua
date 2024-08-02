const express = require('express');
const router = express.Router();
const CreditsController = require('../controllers/creditsController');
const authenticateGoogleOAuth = require('../middleware/authentication');

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// takes the sub from header token and returns
// the number of tokens for this sub
router.get('/user/credits',authenticateGoogleOAuth, CreditsController.getUserCredits);
router.get('/user/allCredits',authenticateGoogleOAuth, CreditsController.getAllUserCredits);
//router.get('/user/addUserCreditRegistry') ???????????????????


//add credits to the user
router.post('/user/add/credits/:CreditValue', authenticateGoogleOAuth, CreditsController.addUserCredits);
//router.get('user/allcredits', CreditsController.getAllCredits);


//return the top 10 users with the biggest credit sum CK
router.get('/user/getTopCredits',authenticateGoogleOAuth, CreditsController.getTopCredits)

// return the number of total credits used CK
router.get('/user/getTotalCredits',authenticateGoogleOAuth, CreditsController.getTotalCredits);




module.exports = router;