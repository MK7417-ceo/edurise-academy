import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Eye, HeartHandshake, Target } from "lucide-react";
import { get, type SiteContent } from "@/lib/api";
import { Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about EduRise Academy — our mission, vision, teaching philosophy and the team behind 10+ years of results.",
};

export default async function AboutPage() {
  const site = await get<SiteContent>("/api/v1/site");

  return (
    <>
      <PageHero
        eyebrow="About EduRise Academy"
        title="A coaching institute built on honesty and results"
        description={`Since ${site.institute.established}, we've helped ${site.institute.stats[1].value} students prepare with discipline, clarity and personal attention.`}
      />

      <section>
        <Container className="py-16 sm:py-20 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">Our story</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">{site.institute.about}</p>
            <p className="mt-4 text-slate-600 leading-relaxed">
              We started with a single classroom and a simple belief: coaching works best when
              teachers know every student's name, strengths and weak chapters. A decade later
              we run six focused programs — but batches are still capped at 30, every student
              still gets a mentor, and our fee structure is still published openly.
            </p>
          </div>
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600">
                  <Target className="h-5 w-5 text-white" />
                </span>
                <h3 className="text-lg font-bold text-navy-900">Our Mission</h3>
              </div>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">{site.institute.mission}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500">
                  <Eye className="h-5 w-5 text-white" />
                </span>
                <h3 className="text-lg font-bold text-navy-900">Our Vision</h3>
              </div>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">{site.institute.vision}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600">
                  <HeartHandshake className="h-5 w-5 text-white" />
                </span>
                <h3 className="text-lg font-bold text-navy-900">How we teach</h3>
              </div>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Concept first, then 10,000+ practice questions, weekly tests and an error log
                every student maintains with their mentor. No shortcuts, no inflated promises —
                just a system that has produced selections every single year.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-navy-950">
        <Container className="py-14 sm:py-16">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {site.institute.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-white">{s.value}</p>
                <p className="mt-1 text-sm text-navy-200">{s.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <SectionHeading
            eyebrow="Principles"
            title="What we will never compromise on"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.institute.why_choose_us.map((w) => (
              <div key={w.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-navy-900">{w.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{w.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/faculty"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              Meet our faculty <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
