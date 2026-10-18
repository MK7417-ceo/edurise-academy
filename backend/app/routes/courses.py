"""Public content endpoints — everything the website renders comes from the
editable knowledge base, so content changes need no code deploy."""
from fastapi import APIRouter, HTTPException

from ..services.knowledge import load_kb

router = APIRouter(tags=["content"])

_COURSE_SUMMARY_FIELDS = (
    "slug", "name", "tagline", "description", "duration",
    "mode", "classes", "features", "fees",
)


def _faculty_by_id(kb: dict, fid: str) -> dict | None:
    return next((f for f in kb["faculty"] if f["id"] == fid), None)


@router.get("/courses")
def list_courses():
    kb = load_kb()
    return [
        {k: c[k] for k in _COURSE_SUMMARY_FIELDS} for c in kb["courses"]
    ]


@router.get("/courses/{slug}")
def course_detail(slug: str):
    kb = load_kb()
    course = next((c for c in kb["courses"] if c["slug"] == slug), None)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found.")
    detail = dict(course)
    detail["faculty"] = [
        _faculty_by_id(kb, fid)
        for fid in course.get("faculty_ids", [])
        if _faculty_by_id(kb, fid)
    ]
    return detail


@router.get("/site")
def site_content():
    """Public site content: institute info, faculty, results, FAQs, etc."""
    kb = load_kb()
    return {
        "institute": kb["institute"],
        "contact": kb["contact"],
        "faculty": kb["faculty"],
        "results": kb["results"],
        "testimonials": kb["testimonials"],
        "faqs": [{"q": f["q"], "a": f["a"]} for f in kb["faqs"]],
        "admission": kb["admission"],
        "scholarships": kb["scholarships"],
        "demo_class": kb["demo_class"],
        "policies": kb["policies"],
        "chatbot": {
            "name": kb["chatbot"]["name"],
            "welcome": kb["chatbot"]["welcome"],
            "suggested_questions": kb["chatbot"]["suggested_questions"],
        },
    }
