const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');

router.get('/drive/:fileId', mediaController.getDriveImage);

module.exports = router;
