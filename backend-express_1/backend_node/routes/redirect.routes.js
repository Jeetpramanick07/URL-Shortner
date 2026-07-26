const { Router } = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { resolveSlug } = require('../controllers/redirect.controller');

const router = Router();

// Matches the FastAPI catch-all: @router.api_route("/{slug}", methods=["GET","HEAD"])
router.get('/:slug', asyncHandler(resolveSlug));
router.head('/:slug', asyncHandler(resolveSlug));

module.exports = router;
