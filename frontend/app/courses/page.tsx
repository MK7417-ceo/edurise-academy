import type { Metadata } from "next";
import Link from "next/link";
import { BadgePercent, Presentation } from "lucide-react";
import { get, type CourseSummary, type SiteContent } from "@/lib/api";
import { Container, CourseCard, CtaBand, PageHero, SectionHeading } from "@/components/ui";
import FaqAccordion from "@/components/FaqAccordion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Explore EduRise Academy courses: JEE Main & Advanced, NEET, CUET, Foundation, Board Excellence and Coding — with fees, batches and faculty.",
};

export default async function CoursesPage() {
  const [courses, site] = await Promise.all([
    get<CourseSummary[]>("/api/v1/courses"),
    get<SiteContent>("/api/v1/site"),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Our Courses"
        title="Programs built for every stage of school"
        description="Six focused programs with published fee ranges, small batches and weekly testing. Pick a course to see the full syllabus, batch timings and faculty."
      />

      <section>
        <Container className="py-14 sm:py-20">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600">
                  <Presentation className="h-5 w-5 text-white" />
                </span>
                <h3 className="text-lg font-bold text-navy-900">Try before you decide</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {site.demo_class.description} {site.demo_class.how_to_book}
              </p>
              <Link
                href="/enquire?message=I+want+to+book+a+free+demo+class"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
              >
                Book a free demo class
              </Link>
            </div>
            <div className="rounded-2xl border border-accent-500/30 bg-orange-50 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500">
                  <BadgePercent className="h-5 w-5 text-white" />
                </span>
                <h3 className="text-lg font-bold text-navy-900">Scholarships up to 100%</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                {site.scholarships.overview}
              </p>
              <Link
                href="/admission#scholarships"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent-600 px-5 py-2.5 text-sm font-bold text-accent-600 transition hover:bg-accent-500 hover:text-white"
              >
                Scholarship rules
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50">
        <Container className="py-14 sm:py-20 max-w-4xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Course questions, answered"
          />
          <FaqAccordion items={site.faqs.slice(0, 6)} />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
