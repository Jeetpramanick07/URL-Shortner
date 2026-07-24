from datetime import date, datetime, time, timezone
from uuid import UUID
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session
from app.models.click_event import ClickEvent
from app.models.link import Link

def dates(date_from: date | None, date_to: date | None):
    if date_from and date_to and date_from > date_to: raise ValueError("date_from must be earlier than or equal to date_to.")
    clauses=[]
    if date_from: clauses.append(ClickEvent.clicked_at >= datetime.combine(date_from, time.min, timezone.utc))
    if date_to: clauses.append(ClickEvent.clicked_at < datetime.combine(date_to, time.max, timezone.utc))
    return clauses
def _events(link_id, clauses): return [ClickEvent.link_id == link_id, *clauses]
def _top(db, field, filters):
    row=db.execute(select(field, func.count()).where(*filters, ClickEvent.is_human.is_(True)).group_by(field).order_by(func.count().desc(), field).limit(1)).first()
    return row[0] if row else None
def summary(db: Session, link_id: UUID, clauses):
    f=_events(link_id, clauses)
    counts=db.execute(select(func.count(), func.count().filter(ClickEvent.is_human), func.count().filter(ClickEvent.is_bot), func.count().filter(ClickEvent.is_preview), func.count().filter(ClickEvent.is_prefetch), func.count().filter(ClickEvent.classification == "head"), func.count(func.distinct(ClickEvent.visitor_hash)).filter(ClickEvent.is_human), func.min(ClickEvent.clicked_at), func.max(ClickEvent.clicked_at)).where(*f)).one()
    device=dict(db.execute(select(ClickEvent.device_category,func.count()).where(*f,ClickEvent.is_human).group_by(ClickEvent.device_category)).all())
    return {"link_id":link_id,"total_requests":counts[0],"total_human_clicks":counts[1],"total_bot_requests":counts[2],"total_preview_requests":counts[3],"total_prefetch_requests":counts[4],"total_head_requests":counts[5],"approximate_unique_visitors":counts[6],"mobile_clicks":device.get("mobile",0),"desktop_clicks":device.get("desktop",0),"tablet_clicks":device.get("tablet",0),"unknown_device_clicks":device.get("unknown",0),"top_keyword":_top(db,ClickEvent.keyword_used,f),"top_operating_system":_top(db,ClickEvent.operating_system,f),"top_browser":_top(db,ClickEvent.browser,f),"top_referrer_domain":_top(db,ClickEvent.referrer_domain,f),"first_click_at":counts[7],"last_click_at":counts[8]}
def breakdown(db, link_id, clauses, column):
    rows=db.execute(select(column,func.count().label("clicks")).where(*_events(link_id,clauses),ClickEvent.is_human).group_by(column).order_by(func.count().desc(),column)).all(); total=sum(r.clicks for r in rows)
    return total,[dict(value=r[0],clicks=r.clicks,percentage=round(r.clicks*100/total,2) if total else 0) for r in rows]
def timeline(db, link_id, clauses, interval):
    period=func.date_trunc(interval,ClickEvent.clicked_at).label("period")
    return db.execute(select(period,func.count().filter(ClickEvent.is_human),func.count().filter(ClickEvent.is_bot),func.count().filter(ClickEvent.is_preview)).where(*_events(link_id,clauses)).group_by(period).order_by(period)).all()
def keyword_breakdown(db, link: Link, clauses):
    rows=dict(db.execute(select(ClickEvent.keyword_position,func.count()).where(*_events(link.id,clauses),ClickEvent.is_human).group_by(ClickEvent.keyword_position)).all()); total=sum(rows.values())
    return total,[{"keyword":k,"keyword_position":i,"clicks":rows.get(i,0),"percentage":round(rows.get(i,0)*100/total,2) if total else 0} for i,k in enumerate(link.keywords)]
