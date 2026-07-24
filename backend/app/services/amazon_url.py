from urllib.parse import urlencode


AMAZON_HOSTS: dict[str, str] = {
    "IN": "www.amazon.in",
    "US": "www.amazon.com",
    "UK": "www.amazon.co.uk",
    "CA": "www.amazon.ca",
    "AU": "www.amazon.com.au",
    "DE": "www.amazon.de",
    "FR": "www.amazon.fr",
    "IT": "www.amazon.it",
    "ES": "www.amazon.es",
    "JP": "www.amazon.co.jp",
    "AE": "www.amazon.ae",
    "SA": "www.amazon.sa",
    "SG": "www.amazon.sg",
    "BR": "www.amazon.com.br",
    "MX": "www.amazon.com.mx",
}


def get_amazon_hostname(country: str) -> str:
    normalized = country.strip().upper()
    try:
        return AMAZON_HOSTS[normalized]
    except KeyError as exc:
        raise ValueError(f"Unsupported Amazon marketplace: {normalized}") from exc


def build_amazon_url(
    *,
    asin: str,
    country: str,
    keyword: str,
    associate_tag: str | None = None,
) -> str:
    """Build a stable Amazon /dp/ASIN destination with minimal parameters."""
    hostname = get_amazon_hostname(country)
    params: dict[str, str] = {
        "keywords": keyword,
        "psc": "1",
    }
    if associate_tag:
        params["tag"] = associate_tag

    return f"https://{hostname}/dp/{asin}?{urlencode(params)}"
