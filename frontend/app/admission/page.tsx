import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgePercent, FileCheck, RotateCcw } from "lucide-react";
import { get, type SiteContent } from "@/lib/api";
import { Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admission Process",
  description:
    "How to join EduRise Academy: counselling, scholarship test, demo class, enrolment. Plus scholarships, documents and refund policy.",
};

export default async function AdmissionPage() {
  const site = await get<SiteContent>("/api/v1/site");

  return (
    <>
      <PageHero
        eyebrow="Admission"
        title={site.admission.title}
        description="Transparent, no-pressure admission. Most families finish the whole process within a week — starting with a free counselling session."
      />

      {/* Steps */}
      <section>
        <Container className="py-14 sm:py-20">
          <SectionHeading
            eyebrow="How It Works"
            title="Your path to the first class"
          />
          <ol className="relative space-y-6 max-w-3xl mx-auto">
            {site.admission.steps.map((s, i) => (
              <li key={s.title} className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-lg font-extrabold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-navy-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm sm:text-base text-slate-600 leading-relaxed">{s.description}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-sm text-slate-500 max-w-2xl mx-auto">{site.admission.note}</p>
          <div className="mt-6 text-center">
            <Link
              href="/enquire"
              className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-accent-600"
            >
              Start Step 1 — Book free counselling <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Documents */}
      <section className="bg-slate-50">
        <Container className="py-14 sm:py-20 max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900">
                <FileCheck className="h-5 w-5 text-accent-400" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900">Documents required</h2>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {site.admission.documents.map((d) => (
                <li key={d} className="flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
                  <FileCheck className="h-4 w-4 mt-0.5 shrink-0 text-brand-600" /> {d}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Scholarships */}
      <section id="scholarships">
        <Container className="py-14 sm:py-20 max-w-4xl">
          <div className="rounded-2xl border border-accent-500/30 bg-orange-50 p-6 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500">
                <BadgePercent className="h-5 w-5 text-white" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900">Scholarships</h2>
            </div>
            <p className="mt-4 text-slate-700 leading-relaxed">{site.scholarships.overview}</p>
            <ul className="mt-5 space-y-2.5">
              {site.scholarships.rules.map((r) => (
                <li key={r} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700">
                  <BadgePercent className="h-4 w-4 mt-1 shrink-0 text-accent-600" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Refund policy */}
      <section className="bg-slate-50">
        <Container className="py-14 sm:py-20 max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600">
                <RotateCcw className="h-5 w-5 text-white" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-navy-900">Refund &amp; cancellation policy</h2>
            </div>
            <p className="mt-4 text-slate-700 leading-relaxed">{site.policies.refund}</p>
            <p className="mt-3 text-slate-700 leading-relaxed">{site.policies.cancellation}</p>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
