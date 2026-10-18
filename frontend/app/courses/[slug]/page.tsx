import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight, BadgeCheck, BookOpen, CalendarClock, CheckCircle2,
  Clock, MapPin, IndianRupee, Users, GraduationCap,
} from "lucide-react";
import { get, inr, type CourseDetail } from "@/lib/api";
import { Container, CtaBand } from "@/components/ui";
import FaqAccordion from "@/components/FaqAccordion";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const course = await get<CourseDetail>(`/api/v1/courses/${slug}`);
    return {
      title: course.name,
      description: course.description,
    };
  } catch {
    return { title: "Course not found" };
  }
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let course: CourseDetail;
  try {
    course = await get<CourseDetail>(`/api/v1/courses/${slug}`);
  } catch {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <section className="bg-navy-950 text-white">
        <Container className="py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest text-accent-400">{course.tagline}</p>
          <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">{course.name}</h1>
          <p className="mt-4 max-w-3xl text-navy-100 text-base sm:text-lg leading-relaxed">{course.description}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Clock className="h-4 w-4 text-accent-400" /> {course.duration}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <MapPin className="h-4 w-4 text-accent-400" /> {course.mode}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Users className="h-4 w-4 text-accent-400" /> {course.classes}
            </span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/enquire?course=${encodeURIComponent(course.name)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-accent-600"
            >
              Enquire Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/enquire?message=I+want+to+book+a+free+demo+class"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Book a Free Demo Class
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-14 sm:py-16 grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Course overview</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">{course.overview}</p>
          </section>

          {/* Syllabus */}
          <section>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Syllabus &amp; modules</h2>
            <div className="mt-5 space-y-4">
              {course.modules.map((m) => (
                <div key={m.title} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-navy-900">
                    <BookOpen className="h-5 w-5 text-brand-600" /> {m.title}
                  </h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {m.topics.map((t) => (
                      <li key={t} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Outcomes */}
          <section>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">What you&apos;ll achieve</h2>
            <ul className="mt-5 space-y-3">
              {course.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-3 rounded-xl bg-brand-50 border border-brand-100 p-4 text-sm sm:text-base text-navy-900">
                  <BadgeCheck className="h-5 w-5 mt-0.5 shrink-0 text-brand-600" />
                  {o}
                </li>
              ))}
            </ul>
          </section>

          {/* Batches */}
          <section>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Batch timings</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-950 text-left text-white">
                    <th className="px-5 py-3.5 font-semibold">Batch</th>
                    <th className="px-5 py-3.5 font-semibold">Days</th>
                    <th className="px-5 py-3.5 font-semibold">Time</th>
                    <th className="px-5 py-3.5 font-semibold">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {course.batches.map((b) => (
                    <tr key={b.name}>
                      <td className="px-5 py-3.5 font-semibold text-navy-900">{b.name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{b.days}</td>
                      <td className="px-5 py-3.5 text-slate-600">{b.time}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{b.mode}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Faculty */}
          <section>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Your faculty</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {course.faculty.map((f) => (
                <Link key={f.id} href="/faculty" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-sm font-extrabold text-accent-400">
                      <GraduationCap className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-bold text-navy-900">{f.name}</p>
                      <p className="text-xs text-slate-500">{f.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{f.qualification} · {f.experience_years} yrs</p>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQs */}
          {course.faqs.length > 0 && (
            <section>
              <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Course FAQs</h2>
              <div className="mt-5">
                <FaqAccordion items={course.faqs} />
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-brand-600" />
              <h3 className="font-bold text-navy-900">Fee range</h3>
            </div>
            <p className="mt-2 text-2xl font-extrabold text-brand-700">
              {inr(course.fees.min)} – {inr(course.fees.max)}
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{course.fees.note}</p>
            <Link
              href={`/enquire?course=${encodeURIComponent(course.name)}`}
              className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-600"
            >
              Enquire Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/chat"
              className="mt-2.5 flex items-center justify-center gap-2 rounded-xl border border-brand-600 px-5 py-3 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
            >
              Ask the AI Assistant
            </Link>
          </div>
          <div className="rounded-2xl bg-navy-950 p-6 text-white">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-accent-400" />
              <h3 className="font-bold">Free demo class</h3>
            </div>
            <p className="mt-2 text-sm text-navy-200 leading-relaxed">
              Attend two real classes with our regular faculty before you pay anything.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="font-bold text-navy-900">Key features</h3>
            <ul className="mt-3 space-y-2">
              {course.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-600" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>

      <CtaBand />
    </>
  );
}
