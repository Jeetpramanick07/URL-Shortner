// Equivalent of app/services/analytics_service.py
const { Op, fn, col, literal } = require('sequelize');
const { ClickEvent } = require('../models');
const AppError = require('../utils/AppError');

/** Build the Sequelize `where` date-range clause from YYYY-MM-DD strings. */
function dateRangeWhere(dateFrom, dateTo) {
  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new AppError(422, 'date_from must be earlier than or equal to date_to.');
  }
  const where = {};
  if (dateFrom) where[Op.gte] = new Date(`${dateFrom}T00:00:00.000Z`);
  if (dateTo) {
    // Mirror Python's `< end-of-day` (time.max) semantics using the start of the next day.
    const end = new Date(`${dateTo}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    where[Op.lt] = end;
  }
  return Object.keys(where).length ? { clicked_at: where } : {};
}

function eventsWhere(linkId, dateWhere) {
  return { link_id: linkId, ...dateWhere };
}

async function topValue(field, where) {
  const rows = await ClickEvent.findAll({
    attributes: [field, [fn('COUNT', col(field)), 'count']],
    where: { ...where, is_human: true },
    group: [field],
    order: [[literal('count'), 'DESC'], [field, 'ASC']],
    limit: 1,
    raw: true,
  });
  return rows.length ? rows[0][field] : null;
}

async function summary(linkId, dateWhere) {
  const where = eventsWhere(linkId, dateWhere);

  const [counts] = await ClickEvent.findAll({
    attributes: [
      [fn('COUNT', col('id')), 'total_requests'],
      [fn('COUNT', literal("CASE WHEN is_human THEN 1 END")), 'total_human_clicks'],
      [fn('COUNT', literal('CASE WHEN is_bot THEN 1 END')), 'total_bot_requests'],
      [fn('COUNT', literal('CASE WHEN is_preview THEN 1 END')), 'total_preview_requests'],
      [fn('COUNT', literal('CASE WHEN is_prefetch THEN 1 END')), 'total_prefetch_requests'],
      [fn('COUNT', literal("CASE WHEN classification = 'head' THEN 1 END")), 'total_head_requests'],
      [fn('COUNT', literal('DISTINCT CASE WHEN is_human THEN visitor_hash END')), 'approximate_unique_visitors'],
      [fn('MIN', col('clicked_at')), 'first_click_at'],
      [fn('MAX', col('clicked_at')), 'last_click_at'],
    ],
    where,
    raw: true,
  });

  const deviceRows = await ClickEvent.findAll({
    attributes: ['device_category', [fn('COUNT', col('id')), 'count']],
    where: { ...where, is_human: true },
    group: ['device_category'],
    raw: true,
  });
  const device = Object.fromEntries(deviceRows.map((row) => [row.device_category, Number(row.count)]));

  const [topKeyword, topOs, topBrowser, topReferrer] = await Promise.all([
    topValue('keyword_used', where),
    topValue('operating_system', where),
    topValue('browser', where),
    topValue('referrer_domain', where),
  ]);

  return {
    link_id: linkId,
    total_requests: Number(counts.total_requests) || 0,
    total_human_clicks: Number(counts.total_human_clicks) || 0,
    total_bot_requests: Number(counts.total_bot_requests) || 0,
    total_preview_requests: Number(counts.total_preview_requests) || 0,
    total_prefetch_requests: Number(counts.total_prefetch_requests) || 0,
    total_head_requests: Number(counts.total_head_requests) || 0,
    approximate_unique_visitors: Number(counts.approximate_unique_visitors) || 0,
    mobile_clicks: device.mobile || 0,
    desktop_clicks: device.desktop || 0,
    tablet_clicks: device.tablet || 0,
    unknown_device_clicks: device.unknown || 0,
    top_keyword: topKeyword,
    top_operating_system: topOs,
    top_browser: topBrowser,
    top_referrer_domain: topReferrer,
    first_click_at: counts.first_click_at,
    last_click_at: counts.last_click_at,
  };
}

async function breakdown(linkId, dateWhere, field) {
  const where = eventsWhere(linkId, dateWhere);
  const rows = await ClickEvent.findAll({
    attributes: [field, [fn('COUNT', col('id')), 'clicks']],
    where: { ...where, is_human: true },
    group: [field],
    order: [[literal('clicks'), 'DESC'], [field, 'ASC']],
    raw: true,
  });
  const total = rows.reduce((sum, row) => sum + Number(row.clicks), 0);
  const data = rows.map((row) => ({
    value: row[field],
    clicks: Number(row.clicks),
    percentage: total ? Math.round((Number(row.clicks) * 100 / total) * 100) / 100 : 0,
  }));
  return { total, data };
}

async function timeline(linkId, dateWhere, interval) {
  const where = eventsWhere(linkId, dateWhere);
  const period = fn('date_trunc', interval, col('clicked_at'));
  const rows = await ClickEvent.findAll({
    attributes: [
      [period, 'period'],
      [fn('COUNT', literal('CASE WHEN is_human THEN 1 END')), 'human_clicks'],
      [fn('COUNT', literal('CASE WHEN is_bot THEN 1 END')), 'bot_requests'],
      [fn('COUNT', literal('CASE WHEN is_preview THEN 1 END')), 'preview_requests'],
    ],
    where,
    group: [period],
    order: [[literal('period'), 'ASC']],
    raw: true,
  });
  return rows.map((row) => ({
    period: row.period,
    human_clicks: Number(row.human_clicks) || 0,
    bot_requests: Number(row.bot_requests) || 0,
    preview_requests: Number(row.preview_requests) || 0,
  }));
}

async function keywordBreakdown(link, dateWhere) {
  const where = eventsWhere(link.id, dateWhere);
  const rows = await ClickEvent.findAll({
    attributes: ['keyword_position', [fn('COUNT', col('id')), 'count']],
    where: { ...where, is_human: true },
    group: ['keyword_position'],
    raw: true,
  });
  const counts = Object.fromEntries(rows.map((row) => [Number(row.keyword_position), Number(row.count)]));
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const data = link.keywords.map((keyword, index) => ({
    keyword,
    keyword_position: index,
    clicks: counts[index] || 0,
    percentage: total ? Math.round(((counts[index] || 0) * 100 / total) * 100) / 100 : 0,
  }));
  return { total, data };
}

module.exports = { dateRangeWhere, eventsWhere, summary, breakdown, timeline, keywordBreakdown };
