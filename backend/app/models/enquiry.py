"""Enquiry model — stores student admission enquiries."""
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from ..database import Base

VALID_STATUSES = ("new", "contacted", "follow_up", "converted", "closed")


class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    enquiry_id = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(120), nullable=False)
    email = Column(String(160), nullable=False)
    phone = Column(String(20), nullable=False)
    student_class = Column(String(40), nullable=False)
    course = Column(String(80), nullable=False)
    mode = Column(String(20), nullable=False)
    city = Column(String(80), nullable=False)
    message = Column(Text, nullable=False)
    consent = Column(Boolean, nullable=False, default=True)
    status = Column(String(20), nullable=False, default="new")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
