const express = require('express');

const upload = require("../middlewares/upload");
const authenticateGoogleOAuth = require("../middlewares/authentication");

const upload_controller = require('../controllers/upload_controller');

const router = express.Router();
router.post('/upload/file', authenticateGoogleOAuth, upload.single("file"), upload_controller.upload_json);
router.get('/active_models', authenticateGoogleOAuth,upload_controller.get_active_models);

module.exports = router;