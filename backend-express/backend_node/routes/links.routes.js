const { Router } = require('express');
const requireAdminKey = require('../middleware/requireAdminKey');
const requireJsonBody = require('../middleware/requireJsonBody');
const validateUuidParam = require('../middleware/validateUuidParam');
const asyncHandler = require('../utils/asyncHandler');
const {
  createLink,
  listLinks,
  getOneLink,
  updateLink,
  enableLink,
  disableLink,
  deleteLink,
} = require('../controllers/links.controller');

const router = Router();
router.use(requireAdminKey);

router.post('/', requireJsonBody, asyncHandler(createLink));
router.get('/', asyncHandler(listLinks));
router.get('/:linkId', validateUuidParam('linkId'), asyncHandler(getOneLink));
router.patch('/:linkId', validateUuidParam('linkId'), requireJsonBody, asyncHandler(updateLink));
router.post('/:linkId/enable', validateUuidParam('linkId'), asyncHandler(enableLink));
router.post('/:linkId/disable', validateUuidParam('linkId'), asyncHandler(disableLink));
router.delete('/:linkId', validateUuidParam('linkId'), asyncHandler(deleteLink));

module.exports = router;
