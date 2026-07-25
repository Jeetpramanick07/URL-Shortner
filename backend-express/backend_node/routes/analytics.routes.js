const { Router } = require('express');
const requireAdminKey = require('../middleware/requireAdminKey');
const validateUuidParam = require('../middleware/validateUuidParam');
const asyncHandler = require('../utils/asyncHandler');
const {
  getSummary,
  getTimeline,
  getDevices,
  getOperatingSystems,
  getBrowsers,
  getReferrers,
  getLanguages,
  getKeywords,
  getRecentClicks,
} = require('../controllers/analytics.controller');

// Mounted at /api/links/:linkId/analytics — mirrors the FastAPI router prefix.
const router = Router({ mergeParams: true });
router.use(requireAdminKey);
router.use(validateUuidParam('linkId'));

router.get('/summary', asyncHandler(getSummary));
router.get('/timeline', asyncHandler(getTimeline));
router.get('/devices', asyncHandler(getDevices));
router.get('/operating-systems', asyncHandler(getOperatingSystems));
router.get('/browsers', asyncHandler(getBrowsers));
router.get('/referrers', asyncHandler(getReferrers));
router.get('/languages', asyncHandler(getLanguages));
router.get('/keywords', asyncHandler(getKeywords));
router.get('/recent-clicks', asyncHandler(getRecentClicks));

module.exports = router;
