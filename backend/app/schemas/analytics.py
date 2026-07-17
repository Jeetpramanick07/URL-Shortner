from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class Summary(BaseModel):
    link_id: UUID; total_requests: int; total_human_clicks: int; total_bot_requests: int; total_preview_requests: int; total_prefetch_requests: int; total_head_requests: int; approximate_unique_visitors: int; mobile_clicks: int; desktop_clicks: int; tablet_clicks: int; unknown_device_clicks: int
    top_keyword: str | None = None; top_operating_system: str | None = None; top_browser: str | None = None; top_referrer_domain: str | None = None; first_click_at: datetime | None = None; last_click_at: datetime | None = None
class TimelinePoint(BaseModel): period: datetime; human_clicks: int; bot_requests: int; preview_requests: int
class Timeline(BaseModel): interval: str; data: list[TimelinePoint]
class BreakdownItem(BaseModel): clicks: int; percentage: float
class DeviceItem(BreakdownItem): device_category: str
class OSItem(BreakdownItem): operating_system: str
class BrowserItem(BreakdownItem): browser: str
class ReferrerItem(BreakdownItem): referrer_domain: str
class LanguageItem(BreakdownItem): language: str
class KeywordItem(BreakdownItem): keyword: str; keyword_position: int
class Breakdown(BaseModel): total_human_clicks: int; data: list[dict]
class RecentClick(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; clicked_at: datetime; classification: str; keyword_used: str | None; keyword_position: int; device_category: str; operating_system: str; browser: str; device_family: str; language: str; referrer_domain: str; country: str | None; city: str | None; request_method: str
class RecentClicks(BaseModel): page: int; page_size: int; total: int; items: list[RecentClick]
