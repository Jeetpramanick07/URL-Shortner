// Equivalent of the business logic inside app/routers/redirect.py.
const { sequelize, Domain, Link, ClickEvent } = require('../models');
const settings = require('../config');
const AppError = require('../utils/AppError');
const { getRequestHostname } = require('../utils/host');
const { classifyRequest } = require('./requestClassifier');
const { advanceAndSelectKeyword, selectKeywordWithoutIncrement } = require('./rotationService');
const { dailyVisitorHash } = require('../utils/visitorIdentity');
const { hashIp } = require('../utils/ipHash');
const { buildAmazonUrl } = require('./amazonUrl.service');

function buildClickEventPayload({ linkId, req, classification, keyword, keywordPosition, isHuman }) {
  const headers = req.headers;
  let country = null;
  let city = null;
  if (settings.trustProxyHeaders) {
    country = headers['cf-ipcountry'] || headers['x-vercel-ip-country'] || headers['cloudfront-viewer-country'] || null;
    city = headers['x-vercel-ip-city'] || null;
  }
  const ip = req.ip || req.socket?.remoteAddress || null;
  const secret = settings.ipHashSecret;

  return {
    link_id: linkId,
    clicked_at: new Date(),
    keyword_used: keyword,
    keyword_position: keywordPosition,
    request_method: req.method,
    user_agent: (headers['user-agent'] || '').slice(0, 2048) || null,
    referrer: classification.referrer,
    ip_hash: hashIp(ip, secret),
    classification: classification.classification,
    device_category: classification.deviceCategory,
    operating_system: classification.operatingSystem,
    browser: classification.browser,
    device_family: classification.deviceFamily,
    country,
    city,
    language: classification.language,
    referrer_domain: classification.referrerDomain,
    visitor_hash: isHuman ? dailyVisitorHash(ip, headers['user-agent'], secret) : null,
    is_bot: classification.isBot,
    is_preview: classification.isPreview,
    is_prefetch: classification.isPrefetch,
    is_human: isHuman,
  };
}

/** Resolve a short link, log the click, and return the Amazon destination URL. */
async function resolveShortLink(req) {
  let hostname;
  try {
    hostname = getRequestHostname(req);
  } catch {
    throw new AppError(404, 'Domain not found.');
  }

  const slug = req.params.slug.toLowerCase();

  const link = await Link.findOne({
    include: [{ model: Domain, as: 'domain', where: { hostname, is_active: true }, attributes: [] }],
    where: { slug },
  });

  if (!link || !link.is_active) {
    throw new AppError(404, 'Link not found.');
  }

  if (link.expires_at && new Date(link.expires_at) <= new Date()) {
    throw new AppError(410, 'This link has expired.');
  }

  const classification = classifyRequest(req.method, req.headers);
  let selection;

  if (!classification.shouldAdvanceKeywordRotation) {
    selection = selectKeywordWithoutIncrement({ clickSequence: link.click_sequence, keywords: link.keywords });
    await ClickEvent.create(
      buildClickEventPayload({ linkId: link.id, req, classification, keyword: selection.keyword, keywordPosition: selection.keywordIndex, isHuman: false })
    );
  } else {
    selection = await sequelize.transaction(async (transaction) => {
      const rotated = await advanceAndSelectKeyword(sequelize, { linkId: link.id, keywords: link.keywords, transaction });
      await ClickEvent.create(
        buildClickEventPayload({ linkId: link.id, req, classification, keyword: rotated.keyword, keywordPosition: rotated.keywordIndex, isHuman: true }),
        { transaction }
      );
      return rotated;
    });
  }

  return buildAmazonUrl({
    asin: link.asin,
    country: link.target_country,
    keyword: selection.keyword,
    associateTag: link.associate_tag,
  });
}

module.exports = { resolveShortLink };
