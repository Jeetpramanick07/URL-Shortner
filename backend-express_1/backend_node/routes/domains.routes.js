const { Router } = require('express');
const requireAdminKey = require('../middleware/requireAdminKey');
const requireJsonBody = require('../middleware/requireJsonBody');
const asyncHandler = require('../utils/asyncHandler');
const { listDomains, createDomain } = require('../controllers/domains.controller');

const router = Router();
router.use(requireAdminKey);

router.get('/', asyncHandler(listDomains));
router.post('/', requireJsonBody, asyncHandler(createDomain));

module.exports = router;
