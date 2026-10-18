"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import {
  ApiError, CLASSES, MODES, post,
  type CourseSummary, type EnquiryPayload,
} from "@/lib/api";

interface Props {
  courses: CourseSummary[];
  presetCourse?: string;
  presetMessage?: string;
  compact?: boolean;
}

const inputCls =
  "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const labelCls = "mb-1.5 block text-sm font-semibold text-navy-900";

export default function EnquiryForm({ courses, presetCourse, presetMessage, compact }: Props) {
  const [form, setForm] = useState<EnquiryPayload>({
    name: "",
    email: "",
    phone: "",
    student_class: compact ? "Parent/Guardian" : "",
    course: presetCourse ?? "",
    mode: compact ? "Not sure yet" : "",
    city: "",
    message: presetMessage ?? "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (k: keyof EnquiryPayload, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Please enter a valid email address.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) e.phone = "Please enter a valid phone number (10–13 digits).";
    if (!compact && !form.student_class) e.student_class = "Please select the student's class.";
    if (!form.course) e.course = "Please choose a course.";
    if (!compact && !form.mode) e.mode = "Please select a preferred mode.";
    if (form.city.trim().length < 2) e.city = "Please enter your city.";
    if (form.message.trim().length < 10) e.message = "Please write at least 10 characters so we can help better.";
    if (!form.consent) e.consent = "Please accept the consent checkbox to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await post<{ enquiry_id: string }>("/api/v1/enquiries", form);
      setDone(res.enquiry_id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError && err.fields) {
        setErrors(err.fields);
      } else {
        setServerError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h3 className="mt-4 text-xl font-extrabold text-navy-900">Enquiry submitted successfully!</h3>
        <p className="mt-2 text-sm text-slate-600">
          Our admission counsellor will contact you within 24 hours.
        </p>
        <p className="mt-4 inline-block rounded-xl bg-white border border-emerald-200 px-5 py-3 text-sm">
          Your enquiry ID: <span className="font-extrabold text-navy-900">{done}</span>
        </p>
        <p className="mt-3 text-xs text-slate-500">Please save this ID for any follow-up.</p>
      </div>
    );
  }

  const field = (key: keyof EnquiryPayload, error?: string) =>
    error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ef-name" className={labelCls}>Full name *</label>
          <input id="ef-name" className={inputCls} value={form.name}
            onChange={(e) => set("name", e.target.value)} placeholder="e.g. Aarav Malhotra" autoComplete="name" />
          {field("name", errors.name)}
        </div>
        <div>
          <label htmlFor="ef-phone" className={labelCls}>Phone number *</label>
          <input id="ef-phone" className={inputCls} value={form.phone}
            onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210"
            inputMode="tel" autoComplete="tel" />
          {field("phone", errors.phone)}
        </div>
      </div>

      <div>
        <label htmlFor="ef-email" className={labelCls}>Email address *</label>
        <input id="ef-email" type="email" className={inputCls} value={form.email}
          onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" autoComplete="email" />
        {field("email", errors.email)}
      </div>

      {!compact && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="ef-class" className={labelCls}>Student&apos;s class *</label>
            <select id="ef-class" className={inputCls} value={form.student_class}
              onChange={(e) => set("student_class", e.target.value)}>
              <option value="">Select class…</option>
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {field("student_class", errors.student_class)}
          </div>
          <div>
            <label htmlFor="ef-mode" className={labelCls}>Preferred mode *</label>
            <select id="ef-mode" className={inputCls} value={form.mode}
              onChange={(e) => set("mode", e.target.value)}>
              <option value="">Select mode…</option>
              {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {field("mode", errors.mode)}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="ef-course" className={labelCls}>Interested course *</label>
          <select id="ef-course" className={inputCls} value={form.course}
            onChange={(e) => set("course", e.target.value)}>
            <option value="">Select course…</option>
            {courses.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
            <option value="General Enquiry">General Enquiry</option>
            <option value="Not sure yet">Not sure yet — need counselling</option>
          </select>
          {field("course", errors.course)}
        </div>
        <div>
          <label htmlFor="ef-city" className={labelCls}>City *</label>
          <input id="ef-city" className={inputCls} value={form.city}
            onChange={(e) => set("city", e.target.value)} placeholder="e.g. Noida" autoComplete="address-level2" />
          {field("city", errors.city)}
        </div>
      </div>

      <div>
        <label htmlFor="ef-message" className={labelCls}>Message *</label>
        <textarea id="ef-message" rows={4} className={inputCls} value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Tell us about the student's class, goals, or ask about fees, batches, scholarships…" />
        {field("message", errors.message)}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm text-slate-600 cursor-pointer">
          <input type="checkbox" checked={form.consent}
            onChange={(e) => set("consent", e.target.checked)}
            className="mt-1 h-4 w-4 rounded accent-blue-700" />
          <span>
            I consent to EduRise Academy contacting me about courses and admissions via
            phone, WhatsApp, SMS or email. *
          </span>
        </label>
        {field("consent", errors.consent)}
        <p className="mt-2 text-xs text-slate-500">
          We collect only the details needed to respond to your enquiry. We never sell
          personal data. See our privacy note on the enquiry page.
        </p>
      </div>

      {serverError && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-700 disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submitting ? "Submitting…" : "Submit Enquiry"}
      </button>
    </form>
  );
}
