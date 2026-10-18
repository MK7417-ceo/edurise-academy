import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MapPin } from "lucide-react";
import { inr, type CourseSummary } from "@/lib/api";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  dark?: boolean;
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-2xl ${alignCls} mb-10 sm:mb-14`}>
      {eyebrow && (
        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${dark ? "text-accent-400" : "text-brand-600"}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${dark ? "text-white" : "text-navy-900"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 text-base sm:text-lg leading-relaxed ${dark ? "text-navy-100" : "text-slate-600"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="bg-navy-950 text-white">
      <Container className="py-14 sm:py-20">
        <p className="text-xs font-bold uppercase tracking-widest text-accent-400 mb-3">{eyebrow}</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl">{title}</h1>
        <p className="mt-4 text-navy-100 text-base sm:text-lg max-w-2xl leading-relaxed">{description}</p>
      </Container>
    </section>
  );
}

export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-0.5">
      <h3 className="text-xl font-bold text-navy-900">{course.name}</h3>
      <p className="mt-1 text-sm font-medium text-brand-600">{course.tagline}</p>
      <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-3">{course.description}</p>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="h-4 w-4 text-brand-600 shrink-0" />
          <span>{course.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="h-4 w-4 text-brand-600 shrink-0" />
          <span>{course.mode}</span>
        </div>
      </dl>
      <ul className="mt-4 space-y-1.5">
        {course.features.slice(0, 3).map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm font-semibold text-navy-900">
        Fee range: <span className="text-brand-700">{inr(course.fees.min)} – {inr(course.fees.max)}</span>
      </p>
      <div className="mt-5 flex gap-3 pt-2 mt-auto">
        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg border border-brand-600 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          View Details
        </Link>
        <Link
          href={`/enquire?course=${encodeURIComponent(course.name)}`}
          className="inline-flex flex-1 items-center justify-center rounded-lg bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600"
        >
          Enquire Now
        </Link>
      </div>
    </article>
  );
}

export function CtaBand() {
  return (
    <section className="bg-brand-600">
      <Container className="py-14 sm:py-16 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Not sure which course fits your child?
          </h2>
          <p className="mt-2 text-brand-100 text-base sm:text-lg">
            Book a free 30-minute counselling session — no obligation, honest guidance.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/enquire"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow transition hover:bg-brand-50"
          >
            Book Free Counselling <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            Chat with AI Assistant
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <h3 className="text-lg font-bold text-navy-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">{description}</p>
    </div>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <h3 className="text-lg font-bold text-red-800">Something went wrong</h3>
      <p className="mt-2 text-sm text-red-700 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16" role="status" aria-label={label}>
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}
