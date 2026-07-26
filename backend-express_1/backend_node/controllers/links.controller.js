// Equivalent of app/routers/links.py
const { Op, literal } = require('sequelize');
const { Domain, Link } = require('../models');
const { validateLinkCreate, validateLinkUpdate } = require('../validators/link.validator');
const { parseLinksListQuery } = require('../validators/query.validator');
const { serializeLink, getClickCount } = require('../services/linkService');
const AppError = require('../utils/AppError');

function missingLink() {
  return new AppError(404, 'Link not found.');
}

async function getDomainOr404(domainId) {
  const domain = await Domain.findByPk(domainId);
  if (!domain) throw new AppError(404, 'Domain not found.');
  return domain;
}

async function commitOrSlugConflict(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      throw new AppError(409, 'A link with this slug already exists for the selected domain.');
    }
    throw err;
  }
}

async function createLink(req, res) {
  const payload = validateLinkCreate(req.body || {});
  const domain = await getDomainOr404(payload.domain_id);

  const link = await commitOrSlugConflict(() =>
    Link.create({
      domain_id: payload.domain_id,
      slug: payload.slug,
      asin: payload.asin,
      target_country: payload.target_country,
      keywords: payload.keywords,
      associate_tag: payload.associate_tag,
      expires_at: payload.expires_at,
      is_active: true,
      click_sequence: 0,
    })
  );

  res.status(201).json(serializeLink({ link, domainHostname: domain.hostname, totalClicks: 0 }));
}

async function listLinks(req, res) {
  const { page, pageSize, domainId, isActive, search } = parseLinksListQuery(req.query);

  const where = {};
  if (domainId !== undefined) where.domain_id = domainId;
  if (isActive !== undefined) where.is_active = isActive;
  if (search) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [{ slug: { [Op.iLike]: term } }, { asin: { [Op.iLike]: term } }];
  }

  const total = await Link.count({ where });

  const rows = await Link.findAll({
    where,
    include: [{ model: Domain, as: 'domain', attributes: ['hostname'] }],
    attributes: {
      include: [
        [
          literal(
            '(SELECT COUNT(*) FROM click_events WHERE click_events.link_id = "Link"."id")'
          ),
          'total_clicks',
        ],
      ],
    },
    order: [['created_at', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  const items = rows.map((row) =>
    serializeLink({
      link: row,
      domainHostname: row.domain.hostname,
      totalClicks: row.get('total_clicks'),
    })
  );

  const pages = total ? Math.ceil(total / pageSize) : 0;
  res.json({ items, page, page_size: pageSize, total, pages });
}

async function getOneLink(req, res) {
  const link = await Link.findByPk(req.params.linkId, {
    include: [{ model: Domain, as: 'domain', attributes: ['hostname'] }],
  });
  if (!link) throw missingLink();

  const totalClicks = await getClickCount(link.id);
  res.json(serializeLink({ link, domainHostname: link.domain.hostname, totalClicks }));
}

async function updateLink(req, res) {
  const link = await Link.findByPk(req.params.linkId);
  if (!link) throw missingLink();

  const updateData = validateLinkUpdate(req.body || {});

  if ('domain_id' in updateData) {
    await getDomainOr404(updateData.domain_id);
  }

  const keywordsChanged = 'keywords' in updateData;
  await commitOrSlugConflict(async () => {
    await link.update({ ...updateData, ...(keywordsChanged ? { click_sequence: 0 } : {}) });
  });

  await link.reload();
  const domain = await getDomainOr404(link.domain_id);
  const totalClicks = await getClickCount(link.id);
  res.json(serializeLink({ link, domainHostname: domain.hostname, totalClicks }));
}

async function setLinkStatus(req, res, enabled) {
  const link = await Link.findByPk(req.params.linkId);
  if (!link) throw missingLink();

  link.is_active = enabled;
  await link.save();

  const domain = await getDomainOr404(link.domain_id);
  const totalClicks = await getClickCount(link.id);
  res.json(serializeLink({ link, domainHostname: domain.hostname, totalClicks }));
}

const enableLink = (req, res) => setLinkStatus(req, res, true);
const disableLink = (req, res) => setLinkStatus(req, res, false);

async function deleteLink(req, res) {
  const link = await Link.findByPk(req.params.linkId);
  if (!link) throw missingLink();
  await link.destroy();
  res.status(204).send();
}

module.exports = {
  createLink,
  listLinks,
  getOneLink,
  updateLink,
  enableLink,
  disableLink,
  deleteLink,
};
