"""Knowledge-base service.

Loads data/knowledge-base.json once and answers admission questions with a
deterministic keyword/scoring matcher. This is the engine behind "mock mode":
it works with zero API keys and never invents fees, dates or guarantees —
anything it cannot answer gets the standard fallback message.
"""
import json
import re
from functools import lru_cache
from pathlib import Path

from ..config import settings

_WORD_RE = re.compile(r"[a-z0-9]+")

FALLBACK = (
    "I'm not certain about that information. "
    "Please submit an enquiry or contact our admission counsellor."
)

GREETINGS = {
    "hi", "hello", "hey", "namaste", "good morning", "good afternoon",
    "good evening", "hii", "hiiiii",
}
GUARANTEE_WORDS = {"guarantee", "guaranteed", "guarantees", "promise", "promised",
                   "assure", "assured", "surety", "certain"}
SELECTION_WORDS = {"selection", "select", "rank", "iit", "aiims", "admission",
                   "seat", "placed", "placement"}
THANKS = {"thanks", "thank", "thankyou", "thank you", "shukriya", "dhanyavaad"}
HUMAN_WORDS = {"human", "counsellor", "counselor", "person", "call me", "phone", "talk to"}


def _words(text: str) -> set:
    return set(_WORD_RE.findall(text.lower()))


@lru_cache(maxsize=1)
def load_kb() -> dict:
    path = Path(settings.KNOWLEDGE_BASE_PATH)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _inr(n: int) -> str:
    return f"₹{n:,}"


def course_summary(course: dict) -> str:
    fees = course["fees"]
    return (
        f"{course['name']} — {course['description']} "
        f"Duration: {course['duration']}. Mode: {course['mode']}. "
        f"Suitable for: {course['classes']}. "
        f"Fee range: {_inr(fees['min'])}–{_inr(fees['max'])}. "
        f"Key features: {'; '.join(course['features'][:3])}."
    )


def course_fee_answer(course: dict) -> str:
    fees = course["fees"]
    return (
        f"The {course['name']} fee range is {_inr(fees['min'])}–{_inr(fees['max'])}. "
        f"{fees['note']} These are indicative ranges — our counsellor will confirm "
        f"the exact fee and any scholarship you qualify for."
    )


def courses_list_answer(kb: dict) -> str:
    names = [c["name"] for c in kb["courses"]]
    return (
        "We offer 6 programs: " + ", ".join(names) + ". "
        "Tell me which one interests you and I'll share details on fees, "
        "batch timings and eligibility."
    )


def admission_steps_answer(kb: dict) -> str:
    steps = kb["admission"]["steps"]
    lines = [f"{i+1}. {s['title']}: {s['description']}" for i, s in enumerate(steps)]
    return "Here's our admission process:\n" + "\n".join(lines)


def contact_answer(kb: dict) -> str:
    c = kb["contact"]
    return (
        f"You can reach us at {c['phone_display']} or {c['email']}. "
        f"Our centre: {c['full_address']}. "
        f"Office hours: {c['office_hours']}."
    )


def answer_question(message: str) -> str:
    """Deterministic mock answer. Never invents facts outside the KB."""
    kb = load_kb()
    text = message.strip().lower()
    tokens = _words(text)

    # Greetings / thanks / human handoff
    if tokens & GREETINGS and len(tokens) <= 3:
        return kb["chatbot"]["welcome"]
    if tokens & THANKS:
        return "You're most welcome! If you have any other questions about courses, fees or admissions, just ask."
    if (tokens & GUARANTEE_WORDS) and (tokens & SELECTION_WORDS):
        return (
            "We don't offer guarantees of selection, ranks or admissions — no honest "
            "institute can promise that. What we do offer is a proven system: small "
            "batches, weekly tests, personal mentorship and a published record of "
            "results you can verify on our Results page."
        )
    if tokens & HUMAN_WORDS:
        c = kb["contact"]
        return (
            "Of course — you can speak directly with our admission counsellor at "
            f"{c['phone_display']} ({c['office_hours']}), or submit the enquiry "
            "form and we'll call you back within 24 hours."
        )

    courses = kb["courses"]

    def matched_course():
        best, best_score = None, 0
        for course in courses:
            kws = set(course.get("keywords", [])) | _words(course["name"])
            score = len(tokens & kws)
            if course["name"].lower() in text:
                score += 3
            if score > best_score:
                best, best_score = course, score
        return best if best_score >= 1 else None

    fee_words = {"fee", "fees", "price", "cost", "charge", "charges", "emi",
                 "installment", "payment", "pay", "expensive"}
    course = matched_course()

    if course and tokens & fee_words:
        return course_fee_answer(course)
    if course:
        return course_summary(course)

    # Specific intents first — generic "courses/offer" check comes last so that
    # e.g. "Do you offer scholarships?" doesn't get a course list.
    if tokens & {"admission", "enroll", "enrol", "join", "apply", "process", "procedure"}:
        return admission_steps_answer(kb)

    if tokens & {"scholarship", "scholarships", "discount", "concession", "waiver", "merit"}:
        rules = kb["scholarships"]["rules"]
        return kb["scholarships"]["overview"] + " " + " ".join(rules[:3])

    if tokens & {"refund", "cancel", "cancellation"}:
        return kb["policies"]["refund"]

    if tokens & {"demo", "trial"}:
        return kb["demo_class"]["how_to_book"]

    if tokens & {"timing", "timings", "batch", "schedule", "time", "slot", "morning", "evening"}:
        faq = next((f for f in kb["faqs"] if f["q"] == "What are the batch timings?"), None)
        return faq["a"] if faq else FALLBACK

    if tokens & {"online", "offline", "hybrid", "classroom"}:
        return (
            "All major courses are available in Online Live mode with interactive "
            "classes, digital study material and doubt support. Offline classroom "
            "batches run at our Noida centre, and Hybrid mode combines both."
        )

    if tokens & {"location", "address", "where", "reach", "centre", "center"}:
        return contact_answer(kb)

    if tokens & {"contact", "number", "email", "whatsapp"}:
        return contact_answer(kb)

    if tokens & {"faculty", "teacher", "teachers", "mentor", "professor"}:
        names = ", ".join(f"{f['name']} ({f['subject']})" for f in kb["faculty"][:4])
        return (
            f"Our core faculty includes {names}, and more — average teaching "
            "experience is 12 years. See the Faculty page for full profiles."
        )

    if tokens & {"material", "books", "notes", "study"}:
        return kb["study_material"]

    if tokens & {"test", "mock", "series"} and "scholarship" not in text:
        return kb["test_series"]

    if tokens & {"document", "documents", "required"}:
        docs = kb["admission"]["documents"]
        return "Documents needed for admission: " + ", ".join(docs) + "."

    if tokens & {"course", "courses", "program", "programs", "offer", "teach"}:
        return courses_list_answer(kb)

    if tokens & fee_words:
        faq = next((f for f in kb["faqs"] if f["q"] == "What are the fees?"), None)
        return faq["a"] if faq else FALLBACK

    # Generic FAQ keyword scoring
    best_faq, best_score = None, 0
    for faq in kb["faqs"]:
        kws = set(faq.get("keywords", []))
        score = len(tokens & kws)
        if score > best_score:
            best_faq, best_score = faq, score
    if best_faq and best_score >= 1:
        return best_faq["a"]

    return FALLBACK
