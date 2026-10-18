"""Public enquiry submission — validated, stored in SQLite, given an ID."""
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Enquiry
from ..schemas import EnquiryCreate, EnquiryCreatedOut
from ..services.rate_limit import rate_limit

router = APIRouter(tags=["enquiries"])


def _generate_enquiry_id(db: Session) -> str:
    year = datetime.now().year
    for _ in range(10):
        eid = f"ER-{year}-{secrets.token_hex(3).upper()}"
        if not db.query(Enquiry).filter_by(enquiry_id=eid).first():
            return eid
    raise RuntimeError("Could not generate a unique enquiry ID.")


@router.post(
    "/enquiries",
    response_model=EnquiryCreatedOut,
    status_code=201,
    dependencies=[Depends(rate_limit(max_calls=10, period_seconds=3600))],
)
def create_enquiry(payload: EnquiryCreate, db: Session = Depends(get_db)):
    enquiry = Enquiry(
        enquiry_id=_generate_enquiry_id(db),
        name=payload.name,
        email=str(payload.email),
        phone=payload.phone,
        student_class=payload.student_class,
        course=payload.course,
        mode=payload.mode,
        city=payload.city,
        message=payload.message,
        consent=payload.consent,
        status="new",
    )
    db.add(enquiry)
    db.commit()
    return EnquiryCreatedOut(enquiry_id=enquiry.enquiry_id)
