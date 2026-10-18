import Link from "next/link";
import {
  ArrowRight, Award, BookOpenCheck, CalendarCheck, CheckCircle2,
  GraduationCap, MessageCircle, PhoneCall, Quote, ShieldCheck,
  Sparkles, Target, TrendingUp, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { get, type CourseSummary, type SiteContent } from "@/lib/api";
import { Container, CourseCard, CtaBand, SectionHeading } from "@/components/ui";
import FaqAccordion from "@/components/FaqAccordion";

export const dynamic = "force-dynamic";

async function load() {
  const [site, courses] = await Promise.all([
    get<SiteContent>("/api/v1/site"),
    get<CourseSummary[]>("/api/v1/courses"),
  ]);
  return { site, courses };
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
      <div className="rounded-3xl bg-navy-950 p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600">
            <GraduationCap className="h-6 w-6 text-white" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Student Progress</p>
            <p className="text-xs text-navy-200">JEE 2026 Batch · Week 24</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
            On track
          </span>
        </div>
        <div className="mt-6 space-y-4">
          {[
            ["Physics — Rotational Mechanics", 92],
            ["Chemistry — Organic Mechanisms", 84],
            ["Mathematics — Definite Integration", 78],
          ].map(([label, pct]) => (
            <div key={label as string}>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium text-navy-100">{label}</span>
                <span className="font-bold text-white">{pct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-accent-500" style={{ width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-3.5">
            <p className="text-2xl font-extrabold text-white">38</p>
            <p className="text-xs text-navy-200">Mocks completed</p>
          </div>
          <div className="rounded-xl bg-white/5 p-3.5">
            <p className="text-2xl font-extrabold text-white">97.4</p>
            <p className="text-xs text-navy-200">Best percentile</p>
          </div>
        </div>
      </div>
      <div className="fade-up absolute -left-3 -top-8 sm:-left-6 rounded-2xl bg-white px-4 py-3 shadow-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-accent-500" />
          <div>
            <p className="text-sm font-extrabold text-navy-900">AIR 247</p>
            <p className="text-xs text-slate-500">JEE Advanced 2025</p>
          </div>
        </div>
      </div>
      <div className="fade-up absolute -bottom-5 -right-3 sm:-right-6 rounded-2xl bg-white px-4 py-3 shadow-xl border border-slate-100" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-extrabold text-navy-900">30 max</p>
            <p className="text-xs text-slate-500">students per batch</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  let data;
  try {
    data = await load();
  } catch {
    return (
      <Container className="py-20">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-12 text-center">
          <h1 className="text-xl font-bold text-red-800">We&apos;re having trouble loading the page</h1>
          <p className="mt-2 text-sm text-red-700">
            The content server isn&apos;t reachable. Please make sure the backend is running and refresh.
          </p>
        </div>
      </Container>
    );
  }
  const { site, courses } = data;
  const popular = courses.slice(0, 3);

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-50 to-white">
        <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div className="fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              Admissions open for 2026–27 batches
            </p>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-navy-950 sm:text-5xl lg:text-6xl">
              Build Your Future with the{" "}
              <span className="text-brand-600">Right Guidance</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {site.institute.about}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-brand-700"
              >
                <BookOpenCheck className="h-4 w-4" />
                Explore Courses
              </Link>
              <Link
                href="/enquire"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-accent-600"
              >
                <PhoneCall className="h-4 w-4" />
                Talk to an Admission Counsellor
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Free demo class &amp; counselling — no obligation
            </div>
          </div>
          <HeroVisual />
        </Container>
      </section>

      {/* ---------- TRUST INDICATORS ---------- */}
      <section className="border-y border-slate-200 bg-white">
        <Container className="grid grid-cols-2 gap-6 py-10 sm:py-12 lg:grid-cols-4">
          {(
            [
              [site.institute.stats[0].value, site.institute.stats[0].label, Award],
              [site.institute.stats[1].value, site.institute.stats[1].label, Users],
              [site.institute.stats[2].value, site.institute.stats[2].label, TrendingUp],
              ["12 yrs avg", "Faculty Experience", GraduationCap],
            ] as [string, string, LucideIcon][]
          ).map(([value, label, Icon]) => (
            <div key={label} className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
                <Icon className="h-6 w-6 text-brand-600" />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-navy-900 sm:text-3xl">{value}</p>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">{label}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ---------- POPULAR COURSES ---------- */}
      <section className="bg-slate-50">
        <Container className="py-16 sm:py-24">
          <SectionHeading
            eyebrow="Our Programs"
            title="Popular courses students love"
            description="Six focused programs — from Class 8 foundations to JEE, NEET, CUET and coding. Every course includes small batches, weekly tests and personal mentorship."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {popular.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-navy-900 px-6 py-3 text-sm font-bold text-navy-900 transition hover:bg-navy-900 hover:text-white"
            >
              View all {courses.length} courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ---------- WHY CHOOSE US ---------- */}
      <section>
        <Container className="py-16 sm:py-24">
          <SectionHeading
            eyebrow="Why EduRise"
            title="Why parents trust us with their child's future"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.institute.why_choose_us.map((w, i) => {
              const icons = [Users, GraduationCap, Target, ShieldCheck, MessageCircle, Award];
              const Icon = icons[i % icons.length];
              return (
                <div key={w.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10">
                    <Icon className="h-5 w-5 text-accent-600" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-navy-900">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{w.description}</p>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ---------- RESULTS BAND ---------- */}
      <section className="bg-navy-950">
        <Container className="py-16 sm:py-24">
          <SectionHeading
            dark
            eyebrow="Results"
            title="Selections our students earned in 2025"
            description="Real ranks from real batches — published every year with verifiable records."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {site.results.slice(0, 6).map((r) => (
              <div key={r.name} className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <p className="text-3xl font-extrabold text-accent-400">{r.achievement}</p>
                <p className="mt-2 font-bold text-white">{r.name}</p>
                <p className="text-sm text-navy-200">{r.exam}</p>
                <p className="mt-1 text-xs text-navy-200/70">{r.course}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/results"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-navy-900 transition hover:bg-navy-100"
            >
              See all success stories <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section>
        <Container className="py-16 sm:py-24">
          <SectionHeading
            eyebrow="Testimonials"
            title="What students and parents say"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {site.testimonials.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <Quote className="h-8 w-8 text-brand-200" />
                <blockquote className="mt-4 text-slate-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-5">
                  <p className="font-bold text-navy-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.relation}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- ADMISSION PROCESS ---------- */}
      <section className="bg-slate-50">
        <Container className="py-16 sm:py-24">
          <SectionHeading
            eyebrow="Getting Started"
            title="Admission in 5 simple steps"
            description="From first call to first class — most students complete the whole process in under a week."
          />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {site.admission.steps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-4 font-bold text-navy-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/admission"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-600 px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
            >
              <CalendarCheck className="h-4 w-4" /> Full admission details
            </Link>
            <Link
              href="/enquire"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-600"
            >
              Start with a free demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ---------- FAQ ---------- */}
      <section>
        <Container className="py-16 sm:py-24 max-w-4xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            description="Quick answers to what parents ask us most. For anything else, ask our AI assistant or a counsellor."
          />
          <FaqAccordion items={site.faqs.slice(0, 8)} />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
