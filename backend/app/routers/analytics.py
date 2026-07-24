from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import require_admin_key
from app.models.click_event import ClickEvent
from app.models.link import Link
from app.schemas.analytics import Summary, Timeline, RecentClicks
from app.services import analytics_service as svc
router=APIRouter(prefix="/api/links/{link_id}/analytics",tags=["Analytics"],dependencies=[Depends(require_admin_key)])
def _link(db, link_id):
    link=db.get(Link,link_id)
    if not link: raise HTTPException(404,"Link not found.")
    return link
def _filters(date_from,date_to):
    try:return svc.dates(date_from,date_to)
    except ValueError as e: raise HTTPException(422,str(e)) from e
@router.get("/summary",response_model=Summary)
def get_summary(link_id:UUID,date_from:date|None=None,date_to:date|None=None,db:Session=Depends(get_db)):
    _link(db,link_id); return svc.summary(db,link_id,_filters(date_from,date_to))
@router.get("/timeline",response_model=Timeline)
def get_timeline(link_id:UUID,interval:str=Query("day",pattern="^(hour|day)$"),date_from:date|None=None,date_to:date|None=None,db:Session=Depends(get_db)):
    _link(db,link_id); return {"interval":interval,"data":[{"period":r[0],"human_clicks":r[1],"bot_requests":r[2],"preview_requests":r[3]} for r in svc.timeline(db,link_id,_filters(date_from,date_to),interval)]}
def _breakdown(field,name):
 def endpoint(link_id:UUID,date_from:date|None=None,date_to:date|None=None,db:Session=Depends(get_db)):
    _link(db,link_id); total,data=svc.breakdown(db,link_id,_filters(date_from,date_to),field); return {"total_human_clicks":total,"data":[{name:x.pop("value"),**x} for x in data]}
 return endpoint
router.add_api_route("/devices",_breakdown(ClickEvent.device_category,"device_category"),methods=["GET"])
router.add_api_route("/operating-systems",_breakdown(ClickEvent.operating_system,"operating_system"),methods=["GET"])
router.add_api_route("/browsers",_breakdown(ClickEvent.browser,"browser"),methods=["GET"])
router.add_api_route("/referrers",_breakdown(ClickEvent.referrer_domain,"referrer_domain"),methods=["GET"])
router.add_api_route("/languages",_breakdown(ClickEvent.language,"language"),methods=["GET"])
@router.get("/keywords")
def keywords(link_id:UUID,date_from:date|None=None,date_to:date|None=None,db:Session=Depends(get_db)):
    return {"total_human_clicks":(result:=svc.keyword_breakdown(db,_link(db,link_id),_filters(date_from,date_to)))[0],"data":result[1]}
@router.get("/recent-clicks",response_model=RecentClicks)
def recent(link_id:UUID,page:int=Query(1,ge=1),page_size:int=Query(20,ge=1,le=100),classification:str|None=None,human_only:bool=False,date_from:date|None=None,date_to:date|None=None,db:Session=Depends(get_db)):
    _link(db,link_id); f=svc._events(link_id,_filters(date_from,date_to));
    if classification: f.append(ClickEvent.classification==classification)
    if human_only:f.append(ClickEvent.is_human)
    total=db.scalar(select(func.count()).select_from(ClickEvent).where(*f)) or 0
    items=db.scalars(select(ClickEvent).where(*f).order_by(ClickEvent.clicked_at.desc()).offset((page-1)*page_size).limit(page_size)).all()
    return {"page":page,"page_size":page_size,"total":total,"items":items}
