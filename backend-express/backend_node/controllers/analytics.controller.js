// Equivalent of app/routers/analytics.py
const { Link, ClickEvent } = require('../models');
const svc = require('../services/analyticsService');
const {
  parseAnalyticsDateRange,
  parseRecentClicksQuery,
  parseTimelineInterval,
} = require('../validators/query.validator');
const AppError = require('../utils/AppError');

async function getLinkOr404(linkId) {
  const link = await Link.findByPk(linkId);
  if (!link) throw new AppError(404, 'Link not found.');
  return link;
}

function dateWhereFromQuery(query) {
  const { dateFrom, dateTo } = parseAnalyticsDateRange(query);
  return svc.dateRangeWhere(dateFrom, dateTo);
}

async function getSummary(req, res) {
  await getLinkOr404(req.params.linkId);
  const result = await svc.summary(req.params.linkId, dateWhereFromQuery(req.query));
  res.json(result);
}

async function getTimeline(req, res) {
  await getLinkOr404(req.params.linkId);
  const interval = parseTimelineInterval(req.query);
  const data = await svc.timeline(req.params.linkId, dateWhereFromQuery(req.query), interval);
  res.json({ interval, data });
}

function makeBreakdownHandler(field, responseKey) {
  return async function handler(req, res) {
    await getLinkOr404(req.params.linkId);
    const { total, data } = await svc.breakdown(req.params.linkId, dateWhereFromQuery(req.query), field);
    res.json({
      total_human_clicks: total,
      data: data.map(({ value, clicks, percentage }) => ({ [responseKey]: value, clicks, percentage })),
    });
  };
}

const getDevices = makeBreakdownHandler('device_category', 'device_category');
const getOperatingSystems = makeBreakdownHandler('operating_system', 'operating_system');
const getBrowsers = makeBreakdownHandler('browser', 'browser');
const getReferrers = makeBreakdownHandler('referrer_domain', 'referrer_domain');
const getLanguages = makeBreakdownHandler('language', 'language');

async function getKeywords(req, res) {
  const link = await getLinkOr404(req.params.linkId);
  const { total, data } = await svc.keywordBreakdown(link, dateWhereFromQuery(req.query));
  res.json({ total_human_clicks: total, data });
}

async function getRecentClicks(req, res) {
  await getLinkOr404(req.params.linkId);
  const { page, pageSize, dateFrom, dateTo, classification, humanOnly } = parseRecentClicksQuery(req.query);

  const dateWhere = svc.dateRangeWhere(dateFrom, dateTo);
  const where = { link_id: req.params.linkId, ...dateWhere };
  if (classification) where.classification = classification;
  if (humanOnly) where.is_human = true;

  const total = await ClickEvent.count({ where });
  const items = await ClickEvent.findAll({
    where,
    order: [['clicked_at', 'DESC']],
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  res.json({
    page,
    page_size: pageSize,
    total,
    items: items.map((item) => ({
      id: Number(item.id),
      clicked_at: item.clicked_at,
      classification: item.classification,
      keyword_used: item.keyword_used,
      keyword_position: item.keyword_position,
      device_category: item.device_category,
      operating_system: item.operating_system,
      browser: item.browser,
      device_family: item.device_family,
      language: item.language,
      referrer_domain: item.referrer_domain,
      country: item.country,
      city: item.city,
      request_method: item.request_method,
    })),
  });
}

module.exports = {
  getSummary,
  getTimeline,
  getDevices,
  getOperatingSystems,
  getBrowsers,
  getReferrers,
  getLanguages,
  getKeywords,
  getRecentClicks,
};
