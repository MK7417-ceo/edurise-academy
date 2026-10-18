# EduRise Academy — Client Demo Script (5–7 minutes)

> Run: backend on :8000, frontend on :3000 (see README §8). Open http://localhost:3000.

## 1. The business website (2 min)
- **Home:** "Notice the trust indicators, popular courses, results band and FAQs —
  everything a parent looks for is on one scroll."
- Click **Courses → JEE Main & Advanced**: "Full syllabus, batch timings table,
  faculty, fee range, FAQs — every course page is complete, no dead ends."
- **Faculty / Results / Admission:** "Real profiles, verifiable 2025 results,
  a 5-step admission process with scholarships and refund policy."

## 2. The AI admission assistant (2 min)
- Click the **chat bubble** (bottom-right): "This is our AI admission counsellor.
  It answers only from our official information — it can't invent fees."
- Try: *"What is the JEE course fee?"* → exact range.
- Try: *"Do you guarantee IIT selection?"* → honest no-guarantee answer.
- Try: *"Where is the institute located?"* → address + hours.
- "It also works as a full page at **/chat**, and runs in demo mode with no API key."

## 3. Enquiry → Admin (2 min)
- **Book a Free Counselling Session** → submit the form (show validation by
  submitting empty once): "Every enquiry gets an ID instantly."
- Open **/admin** (login: `admin` / `edurise123`): "Here's the enquiry we just
  created — search it, open details, move it from New → Contacted, export all
  enquiries as CSV for the counsellors."

## 4. Close (30 sec)
- "Everything is editable in one file — courses, fees, FAQs — no developer needed
  for content changes. It ships with Docker, so your team can deploy it as-is."

## If asked…
- *"Is the AI real?"* — "Demo mode answers from your knowledge base today; plug in
  any OpenAI-compatible key for full AI mode — one env variable."
- *"Can parents pay online?"* — "That's the planned next phase — Razorpay/Stripe
  integration is in the roadmap."
- *"Is the admin login secure?"* — "Current login is a demo mock — production gets
  proper JWT auth; it's flagged in the README."
