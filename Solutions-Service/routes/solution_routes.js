const express = require('express');
const router = express.Router();
const SolutionController = require('../controllers/solutionsController');
const authenticateGoogleOAuth = require('../middleware/authentication');

// Health check route
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

router.get('/user/solutions',authenticateGoogleOAuth, SolutionController.getUserSolution);
router.get('/user/solution/:SolutionId',authenticateGoogleOAuth, SolutionController.getUserDetailSolutionById);
router.get('/allSolutions',authenticateGoogleOAuth, SolutionController.getAllSolutions);


// average duration of execution of all solutions CK
//router.get('/solutions/averageDuration', SolutionController.getAverageDuration);


module.exports = router;