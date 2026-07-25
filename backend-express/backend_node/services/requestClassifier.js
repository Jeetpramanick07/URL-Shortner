// Equivalent of app/services/request_classifier.py.
// NOTE: the original used Python's `user_agents` library; here we use
// `ua-parser-js`, which draws on the same underlying UA-regex family, so
// device/OS/browser family detection matches in the overwhelming majority
// of cases. The explicit PREVIEW_AGENTS / BOT_AGENTS substring lists are
// kept byte-for-byte identical so link-preview and search-crawler
// classification behaves exactly the same regardless of parser library.
const { UAParser } = require('ua-parser-js');

const PREVIEW_AGENTS = [
  'facebookexternalhit', 'facebot', 'whatsapp', 'telegrambot', 'slackbot',
  'discordbot', 'twitterbot', 'linkedinbot', 'skypeuripreview', 'pinterestbot',
  'embedly', 'quora link preview', 'redditbot', 'vkshare',
];
const BOT_AGENTS = [
  'googlebot', 'bingbot', 'baiduspider', 'yandexbot', 'duckduckbot', 'applebot', 'w3c_validator',
];
const PREFETCH_HEADERS = ['purpose', 'sec-purpose', 'x-purpose', 'x-moz', 'sec-fetch-mode', 'sec-fetch-dest'];
const MAX_HEADER_LENGTH = 2048;

function safe(value, fallback = 'unknown') {
  const trimmed = (value || '').trim();
  return trimmed && trimmed.toLowerCase() !== 'other' ? trimmed.slice(0, 255) : fallback;
}

function metadata(userAgent, hints) {
  const parser = new UAParser(userAgent || '');
  const result = parser.getResult();
  const deviceType = result.device.type; // 'mobile' | 'tablet' | 'console' | ... | undefined
  const isBotUa = /bot|crawl|spider|slurp|facebookexternalhit/i.test(userAgent || '');

  let category;
  if (isBotUa) category = 'bot';
  else if (deviceType === 'mobile') category = 'mobile';
  else if (deviceType === 'tablet') category = 'tablet';
  else if (!deviceType) category = 'desktop'; // ua-parser leaves device.type undefined for desktop UAs
  else category = 'unknown';

  if (category === 'unknown' && (hints['sec-ch-ua-mobile'] || '').trim() === '?1') category = 'mobile';

  let osName = safe(result.os.name);
  const osMap = { 'Mac OS': 'macOS' };
  osName = osMap[osName] || osName;
  const platform = (hints['sec-ch-ua-platform'] || '').trim().replace(/"/g, '');
  if (osName === 'unknown' && ['Android', 'Windows', 'Linux', 'Chrome OS'].includes(platform)) osName = platform;
  if (osName === 'unknown' && platform === 'macOS') osName = 'macOS';

  return {
    category,
    osName,
    browser: safe(result.browser.name),
    deviceFamily: safe(result.device.model || result.device.vendor),
    isBot: isBotUa,
  };
}

function language(value) {
  return (value || '').split(',')[0].split(';')[0].trim().slice(0, 35) || 'unknown';
}

function referrer(value) {
  if (!value) return { referrer: null, referrerDomain: 'direct' };
  const raw = value.slice(0, MAX_HEADER_LENGTH);
  let domain = '';
  try {
    domain = (new URL(raw).hostname || '').toLowerCase();
  } catch {
    domain = '';
  }
  return { referrer: raw, referrerDomain: domain || 'direct' };
}

/** Centralized, conservative request classification for redirect analytics. */
function classifyRequest(method, headers) {
  const normalized = {};
  Object.entries(headers || {}).forEach(([key, value]) => {
    normalized[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
  });

  const userAgent = normalized['user-agent'] || '';
  const lowerUa = userAgent.toLowerCase();
  const { category, osName, browser, deviceFamily, isBot: parserBot } = metadata(userAgent, normalized);

  const isPreview = PREVIEW_AGENTS.some((item) => lowerUa.includes(item));
  const isBot = parserBot || BOT_AGENTS.some((item) => lowerUa.includes(item));
  const isPrefetch = PREFETCH_HEADERS.some((name) => {
    const value = (normalized[name] || '').toLowerCase();
    return ['prefetch', 'prerender', 'preview'].some((term) => value.includes(term));
  });

  let classification;
  if (method.toUpperCase() === 'HEAD') classification = 'head';
  else if (isPreview) classification = 'preview';
  else if (isPrefetch) classification = 'prefetch';
  else if (isBot) classification = 'bot';
  else classification = 'human';

  const human = classification === 'human';
  const { referrer: ref, referrerDomain } = referrer(normalized.referer);

  return {
    classification,
    shouldCountAsHumanClick: human,
    shouldAdvanceKeywordRotation: human,
    isBot,
    isPreview,
    isPrefetch,
    deviceCategory: category,
    operatingSystem: osName,
    browser,
    deviceFamily,
    language: language(normalized['accept-language']),
    referrer: ref,
    referrerDomain,
  };
}

module.exports = { classifyRequest };
