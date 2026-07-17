export const mockLinks = [
  {
    id: '377ffa61-9b3c-41c7-ad74-af38fa0e5043',
    domain_id: 1,
    domain: 'go.linkorbit.app',
    slug: 'wireless-earbuds',
    short_url: 'https://go.linkorbit.app/wireless-earbuds',
    asin: 'B0FR4KJ6NT',
    target_country: 'IN',
    keywords: ['best wireless earbuds', 'bluetooth earbuds', 'earbuds for calls', 'noise cancelling earbuds', 'budget earbuds'],
    total_clicks: 14022,
    approximate_unique_visitors: 9844,
    click_sequence: 14022,
    is_active: true,
    created_at: '2026-07-01T08:10:00Z',
    expires_at: null,
  },
  {
    id: '5d0d02e0-7e6f-46bf-baf0-5796ce9f2b4a',
    domain_id: 2,
    domain: 'go.linkorbit.app',
    slug: 'gaming-laptop',
    short_url: 'https://go.linkorbit.app/gaming-laptop',
    asin: 'B0D72PKH6L',
    target_country: 'US',
    keywords: ['gaming laptop', 'best laptop for gaming', 'rtx gaming laptop'],
    total_clicks: 28710,
    approximate_unique_visitors: 21044,
    click_sequence: 28710,
    is_active: false,
    created_at: '2026-06-19T10:20:00Z',
    expires_at: null,
  },
  {
    id: '293b661a-bb92-4ea1-b454-9eebc565c839',
    domain_id: 1,
    domain: 'go.linkorbit.app',
    slug: 'smart-watch',
    short_url: 'https://go.linkorbit.app/smart-watch',
    asin: 'B0B183KNYZ',
    target_country: 'DE',
    keywords: ['smart watch', 'fitness watch', 'bluetooth smart watch', 'waterproof smart watch'],
    total_clicks: 822,
    approximate_unique_visitors: 614,
    click_sequence: 822,
    is_active: true,
    created_at: '2026-06-11T13:30:00Z',
    expires_at: '2026-07-12T00:00:00Z',
  },
  {
    id: 'c7b842ab-0f54-4da2-9550-f7a7934f4e7d',
    domain_id: 3,
    domain: 'shop.linkorbit.app',
    slug: 'mechanical-keyboard',
    short_url: 'https://shop.linkorbit.app/mechanical-keyboard',
    asin: 'B01DFKC2SW',
    target_country: 'US',
    keywords: ['mechanical keyboard', 'gaming keyboard', 'rgb keyboard'],
    total_clicks: 45719,
    approximate_unique_visitors: 31002,
    click_sequence: 45719,
    is_active: true,
    created_at: '2026-05-08T09:15:00Z',
    expires_at: null,
  },
]

export const mockDomains = [
  { id: 1, hostname: 'localhost', display_name: 'Local Development', is_active: true, created_at: '2026-07-01T08:00:00Z' },
  { id: 2, hostname: 'go.example.com', display_name: 'Primary Link Domain', is_active: true, created_at: '2026-07-01T08:00:00Z' },
  { id: 3, hostname: 'link.example.com', display_name: 'Campaign Domain', is_active: true, created_at: '2026-07-01T08:00:00Z' },
]

export const clickTimeline = [
  { label: 'Mon', human: 1480, bots: 180, previews: 80 },
  { label: 'Tue', human: 1990, bots: 220, previews: 110 },
  { label: 'Wed', human: 1760, bots: 165, previews: 95 },
  { label: 'Thu', human: 2370, bots: 260, previews: 130 },
  { label: 'Fri', human: 1890, bots: 205, previews: 105 },
  { label: 'Sat', human: 2150, bots: 245, previews: 125 },
  { label: 'Sun', human: 2780, bots: 310, previews: 160 },
]

export const deviceData = [
  { name: 'Mobile', value: 72 },
  { name: 'Desktop', value: 21 },
  { name: 'Tablet', value: 5 },
  { name: 'Unknown', value: 2 },
]

export const osData = [
  { name: 'Android', value: 46 },
  { name: 'Windows', value: 25 },
  { name: 'iOS', value: 18 },
  { name: 'macOS', value: 8 },
  { name: 'Linux', value: 3 },
]

export const browserData = [
  { name: 'Chrome', value: 52 },
  { name: 'Mobile Safari', value: 22 },
  { name: 'Safari', value: 11 },
  { name: 'Edge', value: 9 },
  { name: 'Firefox', value: 6 },
]

export const recentClicks = [
  { id: 1, clicked_at: '2026-07-17T12:45:00Z', classification: 'human', keyword_used: 'best wireless earbuds', device_category: 'mobile', operating_system: 'Android', browser: 'Chrome Mobile', language: 'en-IN', referrer_domain: 'direct', country: 'IN' },
  { id: 2, clicked_at: '2026-07-17T12:42:00Z', classification: 'preview', keyword_used: null, device_category: 'bot', operating_system: 'unknown', browser: 'facebookexternalhit', language: 'unknown', referrer_domain: 'facebook.com', country: null },
  { id: 3, clicked_at: '2026-07-17T12:37:00Z', classification: 'human', keyword_used: 'bluetooth earbuds', device_category: 'desktop', operating_system: 'Windows', browser: 'Chrome', language: 'en-US', referrer_domain: 'www.google.com', country: 'US' },
  { id: 4, clicked_at: '2026-07-17T12:30:00Z', classification: 'bot', keyword_used: null, device_category: 'bot', operating_system: 'unknown', browser: 'Googlebot', language: 'en', referrer_domain: 'direct', country: null },
  { id: 5, clicked_at: '2026-07-17T12:28:00Z', classification: 'human', keyword_used: 'earbuds for calls', device_category: 'mobile', operating_system: 'iOS', browser: 'Mobile Safari', language: 'en-IN', referrer_domain: 'instagram.com', country: 'IN' },
]
