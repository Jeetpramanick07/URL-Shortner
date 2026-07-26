// Equivalent of app/schemas/link.py — same normalization rules, same
// reserved slugs, same error messages, returned as 422 AppErrors.
const AppError = require('../utils/AppError');
const { AMAZON_HOSTS } = require('../services/amazonUrl.service');

const ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set([
  'api', 'docs', 'redoc', 'openapi.json', 'health', 'admin',
  'login', 'logout', 'favicon.ico', 'robots.txt',
]);

function normalizeSlug(value) {
  if (typeof value !== 'string') throw new Error('Slug must be a string.');
  const slug = value.trim().toLowerCase();
  if (slug.length < 3 || slug.length > 80) {
    throw new Error('Slug must contain between 3 and 80 characters.');
  }
  if (RESERVED_SLUGS.has(slug)) {
    throw new Error('This slug is reserved and cannot be used.');
  }
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error('Slug may contain lowercase letters, numbers and single hyphens only.');
  }
  return slug;
}

function normalizeAsin(value) {
  if (typeof value !== 'string') throw new Error('ASIN must be a string.');
  const asin = value.trim().toUpperCase();
  if (!ASIN_PATTERN.test(asin)) {
    throw new Error('ASIN must contain exactly 10 uppercase letters or digits.');
  }
  return asin;
}

function normalizeCountry(value) {
  if (typeof value !== 'string') throw new Error('Target country must be a string.');
  const country = value.trim().toUpperCase();
  if (!(country in AMAZON_HOSTS)) {
    const supported = Object.keys(AMAZON_HOSTS).sort().join(', ');
    throw new Error(`Unsupported marketplace. Supported values: ${supported}.`);
  }
  return country;
}

function normalizeKeywords(value) {
  if (!Array.isArray(value)) throw new Error('Keywords must be provided as a list.');
  const cleaned = [];
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== 'string') throw new Error('Every keyword must be a string.');
    const keyword = item.trim();
    if (!keyword) continue;
    if (keyword.length > 100) throw new Error('Each keyword must contain at most 100 characters.');
    const comparisonKey = keyword.toLowerCase();
    if (seen.has(comparisonKey)) throw new Error('Duplicate keywords are not allowed.');
    seen.add(comparisonKey);
    cleaned.push(keyword);
  }
  if (!cleaned.length) throw new Error('At least one non-empty keyword is required.');
  if (cleaned.length > 20) throw new Error('A maximum of 20 keywords is allowed.');
  return cleaned;
}

function normalizeOptionalText(value) {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') throw new Error('Value must be a string or null.');
  const cleaned = value.trim();
  return cleaned || null;
}

function ensureAwareDatetime(value, fieldName = 'expires_at') {
  if (value === null || value === undefined) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid ISO 8601 datetime.`);
  }
  // Require an explicit timezone offset in the raw string, same as Pydantic's
  // "Datetime values must include a timezone offset." rule.
  if (typeof value === 'string' && !/(Z|[+-]\d{2}:?\d{2})$/i.test(value.trim())) {
    throw new Error('Datetime values must include a timezone offset.');
  }
  return date;
}

function validateLinkCreate(body) {
  const errors = [];
  const result = {};

  if (!Number.isInteger(body.domain_id) || body.domain_id <= 0) {
    errors.push('domain_id must be a positive integer.');
  } else {
    result.domain_id = body.domain_id;
  }

  const fieldValidators = [
    ['slug', normalizeSlug],
    ['asin', normalizeAsin],
    ['target_country', normalizeCountry],
    ['keywords', normalizeKeywords],
  ];
  for (const [field, validator] of fieldValidators) {
    try {
      result[field] = validator(body[field]);
    } catch (err) {
      errors.push(err.message);
    }
  }

  try {
    if (body.associate_tag !== undefined) {
      const tag = normalizeOptionalText(body.associate_tag);
      if (tag && tag.length > 100) throw new Error('associate_tag must contain at most 100 characters.');
      result.associate_tag = tag;
    } else {
      result.associate_tag = null;
    }
  } catch (err) {
    errors.push(err.message);
  }

  try {
    result.expires_at = body.expires_at !== undefined ? ensureAwareDatetime(body.expires_at) : null;
  } catch (err) {
    errors.push(err.message);
  }

  if (errors.length) throw new AppError(422, errors[0]);
  return result;
}

const NON_NULLABLE_FIELDS = new Set(['domain_id', 'slug', 'asin', 'target_country', 'keywords', 'is_active']);

function validateLinkUpdate(body) {
  const errors = [];
  const result = {};

  const maybeValidate = (field, validator) => {
    if (!(field in body)) return;
    if (body[field] === null) {
      if (NON_NULLABLE_FIELDS.has(field)) {
        errors.push(`${field} cannot be null.`);
      } else {
        result[field] = null;
      }
      return;
    }
    try {
      result[field] = validator(body[field]);
    } catch (err) {
      errors.push(err.message);
    }
  };

  if ('domain_id' in body) {
    if (body.domain_id === null) {
      errors.push('domain_id cannot be null.');
    } else if (!Number.isInteger(body.domain_id) || body.domain_id <= 0) {
      errors.push('domain_id must be a positive integer.');
    } else {
      result.domain_id = body.domain_id;
    }
  }

  maybeValidate('slug', normalizeSlug);
  maybeValidate('asin', normalizeAsin);
  maybeValidate('target_country', normalizeCountry);
  maybeValidate('keywords', normalizeKeywords);

  if ('associate_tag' in body) {
    try {
      const tag = normalizeOptionalText(body.associate_tag);
      if (tag && tag.length > 100) throw new Error('associate_tag must contain at most 100 characters.');
      result.associate_tag = tag;
    } catch (err) {
      errors.push(err.message);
    }
  }

  if ('expires_at' in body) {
    try {
      result.expires_at = ensureAwareDatetime(body.expires_at);
    } catch (err) {
      errors.push(err.message);
    }
  }

  if ('is_active' in body) {
    if (body.is_active === null) {
      errors.push('is_active cannot be null.');
    } else if (typeof body.is_active !== 'boolean') {
      errors.push('is_active must be a boolean.');
    } else {
      result.is_active = body.is_active;
    }
  }

  if (errors.length) throw new AppError(422, errors[0]);
  return result;
}

module.exports = {
  normalizeSlug,
  normalizeAsin,
  normalizeCountry,
  normalizeKeywords,
  validateLinkCreate,
  validateLinkUpdate,
};
