"""Admin endpoints — protected by mock token auth (see services/admin_auth)."""
import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import VALID_STATUSES, Enquiry
from ..schemas import (
    AdminLogin,
    AdminTokenOut,
    EnquiryOut,
    PaginatedEnquiries,
    StatusUpdate,
)
from ..services.admin_auth import create_session, require_admin, verify_credentials
from ..services.rate_limit import rate_limit

router = APIRouter(tags=["admin"])


@router.post("/admin/login", response_model=AdminTokenOut,
             dependencies=[Depends(rate_limit(max_calls=10, period_seconds=60))])
def admin_login(payload: AdminLogin):
    if not verify_credentials(payload.username, payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token, ttl = create_session()
    return AdminTokenOut(token=token, expires_in=ttl)


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
def admin_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Enquiry.id)).scalar() or 0
    new = db.query(func.count(Enquiry.id)).filter(Enquiry.status == "new").scalar() or 0
    by_status = {
        row[0]: row[1]
        for row in db.query(Enquiry.status, func.count(Enquiry.id))
        .group_by(Enquiry.status).all()
    }
    by_course = {
        row[0]: row[1]
        for row in db.query(Enquiry.course, func.count(Enquiry.id))
        .group_by(Enquiry.course).all()
    }
    return {
        "total": total,
        "new": new,
        "by_status": {s: by_status.get(s, 0) for s in VALID_STATUSES},
        "by_course": by_course,
    }


@router.get("/admin/enquiries", response_model=PaginatedEnquiries,
            dependencies=[Depends(require_admin)])
def list_enquiries(
    q: str = Query(default="", max_length=100),
    status: str = Query(default=""),
    course: str = Query(default="", max_length=80),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Enquiry)
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Enquiry.name.ilike(like),
                Enquiry.email.ilike(like),
                Enquiry.phone.ilike(like),
                Enquiry.enquiry_id.ilike(like),
                Enquiry.city.ilike(like),
            )
        )
    if status:
        if status not in VALID_STATUSES:
            raise HTTPException(status_code=400, detail="Invalid status filter.")
        query = query.filter(Enquiry.status == status)
    if course:
        query = query.filter(Enquiry.course == course)
    total = query.count()
    items = (
        query.order_by(Enquiry.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return PaginatedEnquiries(total=total, items=items)


@router.patch("/admin/enquiries/{enquiry_id}/status",
              dependencies=[Depends(require_admin)])
def update_status(enquiry_id: str, payload: StatusUpdate,
                  db: Session = Depends(get_db)):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status.")
    enquiry = db.query(Enquiry).filter_by(enquiry_id=enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found.")
    enquiry.status = payload.status
    db.commit()
    return {"enquiry_id": enquiry_id, "status": enquiry.status}


@router.delete("/admin/enquiries/{enquiry_id}",
               dependencies=[Depends(require_admin)])
def delete_enquiry(enquiry_id: str, db: Session = Depends(get_db)):
    enquiry = db.query(Enquiry).filter_by(enquiry_id=enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found.")
    db.delete(enquiry)
    db.commit()
    return {"deleted": enquiry_id}


@router.get("/admin/enquiries/export.csv", dependencies=[Depends(require_admin)])
def export_csv(db: Session = Depends(get_db)):
    rows = db.query(Enquiry).order_by(Enquiry.created_at.desc()).all()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Enquiry ID", "Name", "Email", "Phone", "Class", "Course",
                     "Mode", "City", "Message", "Status", "Created At"])
    for e in rows:
        writer.writerow([e.enquiry_id, e.name, e.email, e.phone, e.student_class,
                         e.course, e.mode, e.city, e.message, e.status,
                         e.created_at.isoformat() if e.created_at else ""])
    buf.seek(0)
    filename = f"edurise-enquiries-{datetime.now().strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
