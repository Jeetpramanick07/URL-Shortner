// Equivalent of app/services/link_service.py
const settings = require('../config');
const { ClickEvent } = require('../models');

function buildShortUrl(domain, slug) {
  return `${settings.publicScheme}://${domain}/${slug}`;
}

async function getClickCount(linkId) {
  const count = await ClickEvent.count({
    where: { link_id: linkId, is_human: true },
  });
  return Number(count) || 0;
}

/** Shape a Link row (+ its domain hostname + total clicks) into the exact
 * JSON contract the frontend expects (LinkResponse in schemas/link.py). */
function serializeLink({ link, domainHostname, totalClicks }) {
  return {
    id: link.id,
    domain_id: link.domain_id,
    domain: domainHostname,
    slug: link.slug,
    short_url: buildShortUrl(domainHostname, link.slug),
    asin: link.asin,
    target_country: link.target_country,
    keywords: link.keywords,
    associate_tag: link.associate_tag,
    click_sequence: Number(link.click_sequence),
    total_clicks: Number(totalClicks) || 0,
    is_active: link.is_active,
    expires_at: link.expires_at,
    created_at: link.created_at,
    updated_at: link.updated_at,
  };
}

module.exports = { buildShortUrl, getClickCount, serializeLink };
