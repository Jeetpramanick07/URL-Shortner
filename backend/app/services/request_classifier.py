"""Centralized, conservative request classification for redirect analytics."""
from dataclasses import dataclass
from urllib.parse import urlparse

from user_agents import parse

PREVIEW_AGENTS = ("facebookexternalhit", "facebot", "whatsapp", "telegrambot", "slackbot", "discordbot", "twitterbot", "linkedinbot", "skypeuripreview", "pinterestbot", "embedly", "quora link preview", "redditbot", "vkshare")
BOT_AGENTS = ("googlebot", "bingbot", "baiduspider", "yandexbot", "duckduckbot", "applebot", "w3c_validator")
PREFETCH_HEADERS = ("purpose", "sec-purpose", "x-purpose", "x-moz", "sec-fetch-mode", "sec-fetch-dest")
MAX_HEADER_LENGTH = 2048

@dataclass(frozen=True, slots=True)
class RequestClassification:
    classification: str; should_count_as_human_click: bool; should_advance_keyword_rotation: bool
    is_bot: bool; is_preview: bool; is_prefetch: bool
    device_category: str; operating_system: str; browser: str; device_family: str
    language: str; referrer: str | None; referrer_domain: str

def _safe(value: str | None, fallback: str = "unknown") -> str:
    return value.strip()[:255] if value and value.strip() and value.strip().lower() != "other" else fallback

def _metadata(user_agent: str | None, hints: dict[str, str]) -> tuple[str, str, str, str, bool]:
    ua = parse(user_agent or "")
    is_bot = ua.is_bot
    if is_bot: category = "bot"
    elif ua.is_mobile: category = "mobile"
    elif ua.is_tablet: category = "tablet"
    elif ua.is_pc: category = "desktop"
    else: category = "unknown"
    if category == "unknown" and hints.get("sec-ch-ua-mobile", "").strip() == "?1": category = "mobile"
    os_name = _safe(ua.os.family)
    os_name = {"Mac OS X": "macOS", "Other": "unknown"}.get(os_name, os_name)
    platform = hints.get("sec-ch-ua-platform", "").strip().strip('"')
    if os_name == "unknown" and platform in {"Android", "Windows", "Linux", "Chrome OS"}: os_name = platform
    if os_name == "unknown" and platform == "macOS": os_name = "macOS"
    return category, os_name, _safe(ua.browser.family), _safe(ua.device.family), is_bot

def _language(value: str | None) -> str:
    return (value or "").split(",", 1)[0].split(";", 1)[0].strip()[:35] or "unknown"

def _referrer(value: str | None) -> tuple[str | None, str]:
    if not value: return None, "direct"
    raw = value[:MAX_HEADER_LENGTH]
    try: domain = (urlparse(raw).hostname or "").lower()
    except ValueError: domain = ""
    return raw, domain or "direct"

def classify_request(method: str, headers: dict[str, str]) -> RequestClassification:
    normalized = {key.lower(): value for key, value in headers.items()}
    user_agent = normalized.get("user-agent", "")
    lower_ua = user_agent.lower()
    category, operating_system, browser, device_family, parser_bot = _metadata(user_agent, normalized)
    is_preview = any(item in lower_ua for item in PREVIEW_AGENTS)
    is_bot = parser_bot or any(item in lower_ua for item in BOT_AGENTS)
    is_prefetch = any(any(term in normalized.get(name, "").lower() for term in ("prefetch", "prerender", "preview")) for name in PREFETCH_HEADERS)
    if method.upper() == "HEAD": classification = "head"
    elif is_preview: classification = "preview"
    elif is_prefetch: classification = "prefetch"
    elif is_bot: classification = "bot"
    else: classification = "human"
    human = classification == "human"
    referrer, referrer_domain = _referrer(normalized.get("referer"))
    return RequestClassification(classification, human, human, is_bot, is_preview, is_prefetch, category, operating_system, browser, device_family, _language(normalized.get("accept-language")), referrer, referrer_domain)
