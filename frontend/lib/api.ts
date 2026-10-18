/* Typed client for the EduRise FastAPI backend. */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Please check your connection and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI 422 validation errors -> { detail: [{ loc, msg }] }
    if (res.status === 422 && Array.isArray(body.detail)) {
      const fields: Record<string, string> = {};
      for (const e of body.detail) {
        const key = String(e.loc?.[e.loc.length - 1] ?? "form");
        fields[key] = e.msg;
      }
      throw new ApiError(422, "Please fix the highlighted fields.", fields);
    }
    const message =
      typeof body.detail === "string"
        ? body.detail
        : "Something went wrong. Please try again.";
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export const get = <T,>(path: string, init?: RequestInit) =>
  req<T>(path, { ...init, method: "GET" });

export const post = <T,>(path: string, body: unknown, init?: RequestInit) =>
  req<T>(path, { ...init, method: "POST", body: JSON.stringify(body) });

export const patch = <T,>(path: string, body: unknown, init?: RequestInit) =>
  req<T>(path, { ...init, method: "PATCH", body: JSON.stringify(body) });

export const del = <T,>(path: string, init?: RequestInit) =>
  req<T>(path, { ...init, method: "DELETE" });

/* ---------- Types ---------- */

export interface CourseSummary {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  duration: string;
  mode: string;
  classes: string;
  features: string[];
  fees: { min: number; max: number; currency: string; note: string };
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  subject: string;
  qualification: string;
  experience_years: number;
  bio: string;
}

export interface CourseDetail extends CourseSummary {
  overview: string;
  modules: { title: string; topics: string[] }[];
  batches: { name: string; days: string; time: string; mode: string }[];
  faculty: FacultyMember[];
  outcomes: string[];
  faqs: { q: string; a: string }[];
}

export interface SiteContent {
  institute: {
    name: string;
    tagline: string;
    established: number;
    about: string;
    mission: string;
    vision: string;
    stats: { value: string; label: string }[];
    why_choose_us: { title: string; description: string }[];
  };
  contact: {
    phone_display: string;
    email: string;
    full_address: string;
    office_hours: string;
    whatsapp: string;
    whatsapp_display: string;
    social: Record<string, string>;
  };
  faculty: FacultyMember[];
  results: { name: string; exam: string; achievement: string; course: string }[];
  testimonials: { name: string; relation: string; quote: string; course: string }[];
  faqs: { q: string; a: string }[];
  admission: {
    title: string;
    steps: { title: string; description: string }[];
    documents: string[];
    note: string;
  };
  scholarships: { overview: string; rules: string[] };
  demo_class: { description: string; how_to_book: string };
  policies: { refund: string; cancellation: string };
  chatbot: { name: string; welcome: string; suggested_questions: string[] };
}

export interface ChatReply {
  reply: string;
  source: "ai" | "mock";
  suggestions: string[];
}

export interface EnquiryPayload {
  name: string;
  email: string;
  phone: string;
  student_class: string;
  course: string;
  mode: string;
  city: string;
  message: string;
  consent: boolean;
}

export interface EnquiryRecord extends EnquiryPayload {
  enquiry_id: string;
  status: string;
  created_at: string;
}

export interface AdminStats {
  total: number;
  new: number;
  by_status: Record<string, number>;
  by_course: Record<string, number>;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const CLASSES = [
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Dropper/Repeater",
  "Parent/Guardian",
];

export const MODES = ["Online", "Offline", "Hybrid", "Not sure yet"];

export const STATUSES = ["new", "contacted", "follow_up", "converted", "closed"] as const;
export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  follow_up: "Follow-up",
  converted: "Converted",
  closed: "Closed",
};
