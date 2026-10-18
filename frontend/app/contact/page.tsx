import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { get, type CourseSummary, type SiteContent } from "@/lib/api";
import { Container, PageHero, SectionHeading } from "@/components/ui";
import EnquiryForm from "@/components/EnquiryForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact EduRise Academy — phone, email, address, office hours, WhatsApp and a contact form. We reply within 24 hours.",
};

export default async function ContactPage() {
  const [site, courses] = await Promise.all([
    get<SiteContent>("/api/v1/site"),
    get<CourseSummary[]>("/api/v1/courses"),
  ]);
  const c = site.contact;
  const waLink = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(
    "Hi EduRise Academy! I have a question about admissions."
  )}`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent("Sunrise Plaza Sector 62 Noida")}&output=embed`;

  const cards: { icon: LucideIcon; title: string; lines: string[]; href?: string }[] = [
    { icon: Phone, title: "Call us", lines: [c.phone_display], href: `tel:${c.phone_display.replace(/\s/g, "")}` },
    { icon: Mail, title: "Email us", lines: [c.email], href: `mailto:${c.email}` },
    { icon: MapPin, title: "Visit us", lines: [c.full_address] },
    { icon: Clock, title: "Office hours", lines: [c.office_hours] },
  ];

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="We'd love to hear from you"
        description="Call, WhatsApp, email or drop by the centre — a counsellor will respond within 24 hours."
      />

      <section>
        <Container className="py-14 sm:py-20">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600">
                  <card.icon className="h-5 w-5 text-white" />
                </span>
                <h3 className="mt-4 font-bold text-navy-900">{card.title}</h3>
                {card.lines.map((l) =>
                  card.href ? (
                    <a key={l} href={card.href} className="mt-1 block text-sm font-medium text-brand-700 hover:underline break-all">
                      {l}
                    </a>
                  ) : (
                    <p key={l} className="mt-1 text-sm text-slate-600">{l}</p>
                  )
                )}
              </div>
            ))}
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-95"
          >
            <MessageCircle className="h-5 w-5" />
            Chat with us on WhatsApp ({c.whatsapp_display})
          </a>
        </Container>
      </section>

      <section className="bg-slate-50">
        <Container className="grid gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <SectionHeading align="left" eyebrow="Find Us" title="Visit the centre" />
            <div className="-mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                title="EduRise Academy location map"
                src={mapSrc}
                className="h-80 w-full sm:h-96"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Map area is indicative — exact landmarks and directions are shared when you book a visit.
            </p>
          </div>
          <div>
            <SectionHeading align="left" eyebrow="Write To Us" title="Send a message" />
            <div className="-mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <EnquiryForm courses={courses} presetCourse="General Enquiry" compact />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
