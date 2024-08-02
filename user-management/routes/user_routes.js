const express = require('express');
const UserManagementController = require('../controllers/userManagementController');
const authenticateGoogleOAuth = require('../middleware/authentication');

const router = express.Router();

router.post('/checkUser', authenticateGoogleOAuth, UserManagementController.checkUser);
router.get('/allUsers', UserManagementController.allUsers);
router.get('/userDetails',authenticateGoogleOAuth, UserManagementController.userDetails);
//router.get('/allUsers', authenticateGoogleOAuth, UserManagementController.allUsers);

router.post('/changeName/:NewName',authenticateGoogleOAuth, UserManagementController.changeName);
router.post('/admin/changeName/:NewName',authenticateGoogleOAuth, UserManagementController.AdminChangeName);


router.post('/getRole', authenticateGoogleOAuth, UserManagementController.getRole);
router.post('/changeToAdmin', authenticateGoogleOAuth, UserManagementController.changeToAdmin);

module.exports = router;
