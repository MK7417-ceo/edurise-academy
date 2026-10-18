"""Pydantic schemas — request/response validation for the API."""
import re
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, field_validator

PHONE_RE = re.compile(r"^\+?[0-9][0-9\s\-]{7,14}$")
TAG_RE = re.compile(r"<[^>]+>")

VALID_CLASSES = (
    "Class 8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
    "Dropper/Repeater",
    "Parent/Guardian",
)
VALID_MODES = ("Online", "Offline", "Hybrid", "Not sure yet")


def _strip_tags(value: str) -> str:
    return TAG_RE.sub("", value).strip()


class EnquiryCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    student_class: str
    course: str
    mode: str
    city: str
    message: str
    consent: bool

    @field_validator("name", "city", "message", "course")
    @classmethod
    def _clean_text(cls, v: str) -> str:
        return _strip_tags(v)

    @field_validator("name")
    @classmethod
    def _name_valid(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError("Please enter your full name.")
        if len(v) > 120:
            raise ValueError("Name is too long.")
        return v

    @field_validator("phone")
    @classmethod
    def _phone_valid(cls, v: str) -> str:
        v = _strip_tags(v)
        digits = re.sub(r"\D", "", v)
        if not PHONE_RE.match(v) or not (10 <= len(digits) <= 13):
            raise ValueError("Please enter a valid phone number (10–13 digits).")
        return v

    @field_validator("student_class")
    @classmethod
    def _class_valid(cls, v: str) -> str:
        if v not in VALID_CLASSES:
            raise ValueError("Please select the student's class.")
        return v

    @field_validator("mode")
    @classmethod
    def _mode_valid(cls, v: str) -> str:
        if v not in VALID_MODES:
            raise ValueError("Please select a preferred mode.")
        return v

    @field_validator("city")
    @classmethod
    def _city_valid(cls, v: str) -> str:
        if len(v) < 2:
            raise ValueError("Please enter your city.")
        return v

    @field_validator("message")
    @classmethod
    def _message_valid(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError("Please write a message of at least 10 characters.")
        if len(v) > 2000:
            raise ValueError("Message is too long (max 2000 characters).")
        return v

    @field_validator("consent")
    @classmethod
    def _consent_required(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Please accept the consent checkbox to continue.")
        return v


class EnquiryOut(BaseModel):
    enquiry_id: str
    name: str
    email: str
    phone: str
    student_class: str
    course: str
    mode: str
    city: str
    message: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EnquiryCreatedOut(BaseModel):
    enquiry_id: str
    message: str = "Enquiry submitted successfully. Our counsellor will contact you within 24 hours."


class StatusUpdate(BaseModel):
    status: str


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminTokenOut(BaseModel):
    token: str
    expires_in: int


class ChatRequest(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def _message_valid(cls, v: str) -> str:
        v = _strip_tags(v)
        if len(v) < 1:
            raise ValueError("Message cannot be empty.")
        if len(v) > 1000:
            raise ValueError("Message is too long (max 1000 characters).")
        return v


class ChatResponse(BaseModel):
    reply: str
    source: str  # "ai" | "mock"
    suggestions: List[str] = []


class PaginatedEnquiries(BaseModel):
    total: int
    items: List[EnquiryOut]
