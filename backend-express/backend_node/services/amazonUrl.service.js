// Equivalent of app/services/amazon_url.py
const AMAZON_HOSTS = {
  IN: 'www.amazon.in',
  US: 'www.amazon.com',
  UK: 'www.amazon.co.uk',
  CA: 'www.amazon.ca',
  AU: 'www.amazon.com.au',
  DE: 'www.amazon.de',
  FR: 'www.amazon.fr',
  IT: 'www.amazon.it',
  ES: 'www.amazon.es',
  JP: 'www.amazon.co.jp',
  AE: 'www.amazon.ae',
  SA: 'www.amazon.sa',
  SG: 'www.amazon.sg',
  BR: 'www.amazon.com.br',
  MX: 'www.amazon.com.mx',
};

function getAmazonHostname(country) {
  const normalized = (country || '').trim().toUpperCase();
  const hostname = AMAZON_HOSTS[normalized];
  if (!hostname) throw new Error(`Unsupported Amazon marketplace: ${normalized}`);
  return hostname;
}

/** Build a stable Amazon /dp/ASIN destination with minimal parameters. */
function buildAmazonUrl({ asin, country, keyword, associateTag }) {
  const hostname = getAmazonHostname(country);
  const params = new URLSearchParams({ keywords: keyword, psc: '1' });
  if (associateTag) params.set('tag', associateTag);
  return `https://${hostname}/dp/${asin}?${params.toString()}`;
}

module.exports = { AMAZON_HOSTS, getAmazonHostname, buildAmazonUrl };
