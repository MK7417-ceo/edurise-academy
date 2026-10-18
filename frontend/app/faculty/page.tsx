import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";
import { get, type SiteContent } from "@/lib/api";
import { Container, CtaBand, PageHero, SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Faculty",
  description:
    "Meet the EduRise Academy faculty — full-time educators with 8–16 years of teaching experience across Physics, Chemistry, Maths, Biology and more.",
};

const initials = (name: string) =>
  name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/, "").split(" ").map((p) => p[0]).slice(0, 2).join("");

export default async function FacultyPage() {
  const site = await get<SiteContent>("/api/v1/site");

  return (
    <>
      <PageHero
        eyebrow="Our Faculty"
        title="Teachers who are accountable for results"
        description="Full-time educators — not visiting lecturers. Average teaching experience across the team is 12 years, and every faculty member mentors a small group personally."
      />

      <section>
        <Container className="py-14 sm:py-20">
          <SectionHeading
            eyebrow="The Team"
            title="Learn from people who've done it before"
            description="IIT, AIIMS and IIM alumni alongside career educators — each one chosen for subject mastery and the patience to teach it."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {site.faculty.map((f) => (
              <article key={f.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-xl font-extrabold text-accent-400">
                    {initials(f.name)}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-navy-900">{f.name}</h3>
                    <p className="text-sm font-medium text-brand-600">{f.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600 leading-relaxed">{f.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    <Briefcase className="h-3 w-3" /> {f.experience_years} yrs experience
                  </span>
                  <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
                    {f.qualification}
                  </span>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 rounded-2xl bg-navy-950 p-8 sm:p-10 text-center">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Want to learn from them directly?</h2>
            <p className="mt-2 text-navy-200 text-sm sm:text-base">
              Sit in a real class with our faculty — free, no obligation.
            </p>
            <Link
              href="/enquire?message=I+want+to+book+a+free+demo+class"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-600"
            >
              Book a free demo class <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
