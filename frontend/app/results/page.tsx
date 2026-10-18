import type { Metadata } from "next";
import { Award, Quote, ShieldCheck } from "lucide-react";
import { get, type SiteContent } from "@/lib/api";
import { Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Results & Success Stories",
  description:
    "EduRise Academy results: JEE, NEET, CUET and board achievements from 2025, plus stories from students and parents.",
};

export default async function ResultsPage() {
  const site = await get<SiteContent>("/api/v1/site");

  return (
    <>
      <PageHero
        eyebrow="Results"
        title="Selections our students earned"
        description="We publish our results every year with verifiable records — because trust is earned with evidence, not adjectives."
      />

      <section>
        <Container className="py-14 sm:py-20">
          <SectionHeading
            eyebrow="2025 Highlights"
            title="Ranks, percentiles and board scores"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {site.results.map((r) => (
              <article key={r.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10">
                  <Award className="h-5 w-5 text-accent-600" />
                </span>
                <p className="mt-4 text-2xl font-extrabold text-navy-900">{r.achievement}</p>
                <p className="mt-1 font-bold text-slate-800">{r.name}</p>
                <p className="text-sm text-slate-500">{r.exam}</p>
                <p className="mt-2 text-xs font-medium text-brand-700">{r.course}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <p>
              Result records are maintained with roll numbers and scorecards at the centre office
              and shared with parents during counselling. We never publish a result we
              can&apos;t verify.
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50">
        <Container className="py-14 sm:py-20">
          <SectionHeading
            eyebrow="Success Stories"
            title="In their own words"
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

      <CtaBand />
    </>
  );
}
