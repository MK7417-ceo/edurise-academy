"""End-to-end verification suite for EduRise Academy (Playwright).

Covers: homepage render, chatbot (known + unknown questions), course listing &
detail, enquiry form validation + submission, admin login + dashboard listing,
mobile viewport, and browser console errors.

Requires: pip install playwright && playwright install chromium
Run: python qa/verify.py  (with backend on :8000 and frontend on :3000)
"""
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
SHOT = Path(__file__).resolve().parent.parent / "docs" / "screenshots"
SHOT.mkdir(parents=True, exist_ok=True)

errors: list[str] = []
results: list[str] = []


def check(name: str, ok: bool, detail: str = ""):
    results.append(f"{'PASS' if ok else 'FAIL'}: {name}" + (f" — {detail}" if detail else ""))
    if not ok:
        errors.append(name)


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        console_errors: list[str] = []
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(str(e)))

        # 1. Homepage
        page.goto(BASE + "/", wait_until="networkidle")
        check("home renders hero headline", "Build Your Future" in page.content())
        check("home trust indicators", "Students Guided" in page.content())
        page.screenshot(path=str(SHOT / "home.png"))

        # 2. Chat widget: known + unknown questions
        page.click('button[aria-label="Chat with EduRise Admission Assistant"]')
        page.wait_for_selector("text=EduRise Admission Assistant", timeout=15000)
        chips = page.locator("button").filter(has_text="What is the JEE course fee?")
        check("chat welcome + suggested questions", chips.count() > 0)
        chips.first.click()
        page.wait_for_selector("text=₹85,000", timeout=20000)
        check("chat answers known fee question", "₹85,000" in page.content())
        page.fill('input[aria-label="Type your message"]', "What is the capital of France?")
        page.click('button[aria-label="Send message"]')
        page.wait_for_function(
            "() => document.body.innerText.includes('not certain about that information')",
            timeout=20000,
        )
        check("chat safely refuses unknown question", True)
        page.screenshot(path=str(SHOT / "chatbot.png"))

        # 3. Courses + detail
        page.goto(BASE + "/courses", wait_until="networkidle")
        check("courses list shows 6 enquire buttons", page.content().count("Enquire Now") >= 6)
        page.screenshot(path=str(SHOT / "courses.png"))
        page.goto(BASE + "/courses/neet-preparation", wait_until="networkidle")
        check("course detail renders", "NEET Preparation" in page.content() and "Batch timings" in page.content())

        # 4. Enquiry form validation + submission
        page.goto(BASE + "/enquire", wait_until="networkidle")
        page.click('button[type="submit"]')
        page.wait_for_selector("text=Please enter your full name.", timeout=5000)
        check("enquiry validation on empty submit", True)
        page.fill("#ef-name", "QA Test User")
        page.fill("#ef-email", "qa@example.com")
        page.fill("#ef-phone", "+919812345678")
        page.select_option("#ef-class", "Class 12")
        page.select_option("#ef-course", "NEET Preparation")
        page.select_option("#ef-mode", "Hybrid")
        page.fill("#ef-city", "Delhi")
        page.fill("#ef-message", "QA automated test enquiry, please ignore.")
        page.check('input[type="checkbox"]')
        page.click('button[type="submit"]')
        page.wait_for_selector("text=Enquiry submitted successfully!", timeout=15000)
        eid = page.locator("text=Your enquiry ID:").inner_text()
        check("enquiry submit + ID generated", "ER-2026-" in eid, eid)
        page.screenshot(path=str(SHOT / "enquiry-success.png"))

        # 5. Admin login + dashboard lists the enquiry
        page.goto(BASE + "/admin/login", wait_until="networkidle")
        page.screenshot(path=str(SHOT / "admin-login.png"))
        page.fill("#au", "admin")
        page.fill("#ap", "edurise123")
        page.click('button[type="submit"]')
        page.wait_for_selector("text=Enquiry Dashboard", timeout=15000)
        page.wait_for_selector("text=QA Test User", timeout=15000)
        check("admin dashboard lists new enquiry", True)
        page.screenshot(path=str(SHOT / "admin.png"))

        # 6. Mobile viewport
        mob = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True)
        mp = mob.new_page()
        mp.goto(BASE + "/", wait_until="networkidle")
        mp.screenshot(path=str(SHOT / "home-mobile.png"))
        overflow = mp.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
        check("mobile no horizontal overflow", overflow <= 1, f"overflow={overflow}px")
        mob.close()

        check("no console/page errors", len(console_errors) == 0,
              "; ".join(console_errors[:3]) if console_errors else "clean")
        browser.close()

    print("\n".join(results))
    print(f"\n{len(errors)} failure(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
