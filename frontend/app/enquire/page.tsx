import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { get, type CourseSummary } from "@/lib/api";
import { Container, PageHero, Spinner } from "@/components/ui";
import EnquiryForm from "@/components/EnquiryForm";
import EnquireFormLoader from "./form-loader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Student Enquiry",
  description:
    "Submit a student enquiry to EduRise Academy — book free counselling, ask about fees and batches, or request a demo class.",
};

export default async function EnquirePage() {
  const courses = await get<CourseSummary[]>("/api/v1/courses");

  return (
    <>
      <PageHero
        eyebrow="Student Enquiry"
        title="Talk to us — we'll guide you honestly"
        description="Fill the form and our admission counsellor will call you back within 24 hours. No spam, no pressure — just clear answers."
      />
      <section>
        <Container className="py-14 sm:py-16 grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
              <Suspense fallback={<Spinner label="Loading form…" />}>
                <EnquireFormLoader courses={courses} />
              </Suspense>
            </div>
          </div>
          <aside className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl bg-navy-950 p-6 sm:p-8 text-white">
              <h2 className="text-lg font-extrabold">What happens next?</h2>
              <ol className="mt-4 space-y-3 text-sm text-navy-100">
                <li><span className="font-bold text-accent-400">1.</span> You submit the enquiry — you get an enquiry ID instantly.</li>
                <li><span className="font-bold text-accent-400">2.</span> A counsellor calls within 24 hours to understand your goals.</li>
                <li><span className="font-bold text-accent-400">3.</span> You take the free scholarship test and attend a demo class.</li>
                <li><span className="font-bold text-accent-400">4.</span> You decide — with the full fee structure in writing.</li>
              </ol>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-navy-900">Privacy notice</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                We ask only for the details needed to respond to your enquiry (name, contact,
                class, course interest and your message). Your data is used solely for admission
                counselling, is never sold or shared with third parties for marketing, and you
                can ask us to delete it at any time by emailing us.
              </p>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
