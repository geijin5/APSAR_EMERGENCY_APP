/**
 * API Routes
 */

const express = require('express');
const router = express.Router();

// Placeholder routes - implement based on API_ENDPOINTS.md
router.use('/auth', require('./auth'));
router.use('/vehicles', require('./vehicles'));
router.use('/equipment', require('./equipment'));
router.use('/certifications', require('./certifications'));
router.use('/training', require('./training'));
router.use('/checklists', require('./checklists'));
router.use('/resources', require('./resources'));
router.use('/callout-reports', require('./calloutReports'));
router.use('/notifications', require('./notifications'));
router.use('/personnel/chat', require('./chat'));
router.use('/personnel/call-outs', require('./callOuts'));
router.use('/personnel/sar', require('./sarMissions'));
router.use('/personnel/incidents', require('./incidents'));
router.use('/public', require('./public'));

module.exports = router;

