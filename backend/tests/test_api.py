"""Backend API tests — run with:  python -m pytest backend/tests -q
Run from the repository root. Uses a temporary SQLite database.
"""
import os
import tempfile

_tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_tmp.close()
os.environ["DATABASE_PATH"] = _tmp.name
# Knowledge base resolves relative to CWD (repo root when run as documented)

from fastapi.testclient import TestClient  # noqa: E402

from backend.app.database import Base, engine  # noqa: E402
from backend.app.main import app  # noqa: E402

Base.metadata.create_all(bind=engine)

client = TestClient(app)

VALID_ENQUIRY = {
    "name": "Test Student",
    "email": "test@example.com",
    "phone": "+919876543210",
    "student_class": "Class 11",
    "course": "JEE Main & Advanced",
    "mode": "Offline",
    "city": "Noida",
    "message": "I want details about the JEE batch timings please.",
    "consent": True,
}


def test_health():
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["chatbot"]["mode"] in ("mock", "ai")


def test_chat_known_fee():
    r = client.post("/api/v1/chat", json={"message": "What is the JEE course fee?"})
    assert r.status_code == 200
    body = r.json()
    assert "85,000" in body["reply"]
    assert body["source"] in ("mock", "ai")


def test_chat_known_scholarship():
    r = client.post("/api/v1/chat", json={"message": "Do you offer scholarships?"})
    assert r.status_code == 200
    assert "scholarship" in r.json()["reply"].lower()


def test_chat_unknown_refuses_safely():
    r = client.post("/api/v1/chat", json={"message": "What is the population of Mumbai?"})
    assert r.status_code == 200
    assert r.json()["reply"].startswith("I'm not certain about that information.")


def test_chat_guarantee_refused():
    r = client.post("/api/v1/chat", json={"message": "Do you guarantee IIT selection?"})
    assert r.status_code == 200
    assert "don't offer guarantees" in r.json()["reply"]


def test_chat_suggested_questions():
    r = client.get("/api/v1/chat/suggested")
    assert r.status_code == 200
    assert len(r.json()["questions"]) >= 8


def test_courses_list():
    r = client.get("/api/v1/courses")
    assert r.status_code == 200
    courses = r.json()
    assert len(courses) == 6
    assert {c["slug"] for c in courses} >= {"jee-main-advanced", "neet-preparation"}


def test_course_detail():
    r = client.get("/api/v1/courses/neet-preparation")
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "NEET Preparation"
    assert len(body["modules"]) > 0
    assert len(body["faculty"]) > 0


def test_course_detail_404():
    r = client.get("/api/v1/courses/no-such-course")
    assert r.status_code == 404


def test_enquiry_validation_rejects_bad_input():
    bad = dict(VALID_ENQUIRY, email="not-an-email", phone="123", message="hi", consent=False)
    r = client.post("/api/v1/enquiries", json=bad)
    assert r.status_code == 422


def test_enquiry_create_and_admin_flow():
    # create
    r = client.post("/api/v1/enquiries", json=VALID_ENQUIRY)
    assert r.status_code == 201
    eid = r.json()["enquiry_id"]
    assert eid.startswith("ER-")

    # admin login
    r = client.post("/api/v1/admin/login", json={"username": "admin", "password": "wrong"})
    assert r.status_code == 401
    r = client.post("/api/v1/admin/login", json={"username": "admin", "password": "edurise123"})
    assert r.status_code == 200
    token = r.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # appears in admin list
    r = client.get(f"/api/v1/admin/enquiries?q={eid}", headers=headers)
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) == 1 and items[0]["name"] == "Test Student"

    # status update
    r = client.patch(f"/api/v1/admin/enquiries/{eid}/status",
                     json={"status": "contacted"}, headers=headers)
    assert r.status_code == 200 and r.json()["status"] == "contacted"

    # CSV export contains the enquiry
    r = client.get("/api/v1/admin/enquiries/export.csv", headers=headers)
    assert r.status_code == 200
    assert eid in r.text

    # admin endpoints require auth
    r = client.get("/api/v1/admin/stats")
    assert r.status_code == 401
