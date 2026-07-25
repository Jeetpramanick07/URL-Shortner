// Equivalent of the FastAPI Query(...) constraints used throughout
// routers/links.py and routers/analytics.py.
const AppError = require('../utils/AppError');

function parsePagination(query, { defaultPageSize = 20, maxPageSize = 100 } = {}) {
  let page = 1;
  let pageSize = defaultPageSize;

  if (query.page !== undefined) {
    page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      throw new AppError(422, 'page must be an integer greater than or equal to 1.');
    }
  }

  if (query.page_size !== undefined) {
    pageSize = Number(query.page_size);
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > maxPageSize) {
      throw new AppError(422, `page_size must be an integer between 1 and ${maxPageSize}.`);
    }
  }

  return { page, pageSize };
}

function parseLinksListQuery(query) {
  const { page, pageSize } = parsePagination(query);

  let domainId;
  if (query.domain_id !== undefined && query.domain_id !== '') {
    domainId = Number(query.domain_id);
    if (!Number.isInteger(domainId) || domainId <= 0) {
      throw new AppError(422, 'domain_id must be a positive integer.');
    }
  }

  let isActive;
  if (query.is_active !== undefined && query.is_active !== '') {
    if (!['true', 'false'].includes(String(query.is_active).toLowerCase())) {
      throw new AppError(422, 'is_active must be true or false.');
    }
    isActive = String(query.is_active).toLowerCase() === 'true';
  }

  let search;
  if (query.search !== undefined && query.search !== '') {
    search = String(query.search);
    if (search.length > 100) {
      throw new AppError(422, 'search must contain at most 100 characters.');
    }
  }

  return { page, pageSize, domainId, isActive, search };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseDateParam(value, fieldName) {
  if (value === undefined || value === null || value === '') return undefined;
  if (!DATE_RE.test(value)) {
    throw new AppError(422, `${fieldName} must be a date in YYYY-MM-DD format.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(422, `${fieldName} must be a valid date.`);
  }
  return value; // keep the raw YYYY-MM-DD string; the service builds the range
}

function parseAnalyticsDateRange(query) {
  const dateFrom = parseDateParam(query.date_from, 'date_from');
  const dateTo = parseDateParam(query.date_to, 'date_to');
  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new AppError(422, 'date_from must be earlier than or equal to date_to.');
  }
  return { dateFrom, dateTo };
}

function parseRecentClicksQuery(query) {
  const { page, pageSize } = parsePagination(query);
  const { dateFrom, dateTo } = parseAnalyticsDateRange(query);

  let classification;
  if (query.classification !== undefined && query.classification !== '') {
    classification = String(query.classification);
  }

  const humanOnly = String(query.human_only).toLowerCase() === 'true';

  return { page, pageSize, dateFrom, dateTo, classification, humanOnly };
}

function parseTimelineInterval(query) {
  const interval = query.interval || 'day';
  if (!['hour', 'day'].includes(interval)) {
    throw new AppError(422, "interval must be one of: 'hour', 'day'.");
  }
  return interval;
}

module.exports = {
  parsePagination,
  parseLinksListQuery,
  parseAnalyticsDateRange,
  parseRecentClicksQuery,
  parseTimelineInterval,
};
