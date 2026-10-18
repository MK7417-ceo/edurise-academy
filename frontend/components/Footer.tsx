import Link from "next/link";
import { GraduationCap, Phone, Mail, MapPin, Clock } from "lucide-react";
import { get, type SiteContent } from "@/lib/api";

async function footerData() {
  try {
    const site = await get<SiteContent>("/api/v1/site", { next: { revalidate: 3600 } });
    return { contact: site.contact, courses: [] as string[] };
  } catch {
    return null;
  }
}

export default async function Footer() {
  const data = await footerData();
  const contact = data?.contact;

  const courseLinks = [
    ["JEE Main & Advanced", "/courses/jee-main-advanced"],
    ["NEET Preparation", "/courses/neet-preparation"],
    ["CUET Preparation", "/courses/cuet-preparation"],
    ["Foundation Course", "/courses/foundation-course"],
    ["Board Exam Excellence", "/courses/board-exam-excellence"],
    ["Coding & Technology", "/courses/coding-technology"],
  ];

  const socials = contact?.social ?? {};

  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <GraduationCap className="h-6 w-6 text-accent-400" />
              </span>
              <span className="text-lg font-extrabold text-white">EduRise Academy</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy-200">
              Learn Today. Lead Tomorrow. Result-focused coaching for JEE, NEET, CUET,
              boards and coding — with small batches and honest guidance since 2014.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                [socials.facebook, "Facebook"],
                [socials.instagram, "Instagram"],
                [socials.youtube, "YouTube"],
                [socials.linkedin, "LinkedIn"],
              ].map(([href, label]) =>
                href ? (
                  <a
                    key={label as string}
                    href={href as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label as string}
                    className="rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-navy-100 transition hover:bg-white/20 hover:text-white"
                  >
                    {label}
                  </a>
                ) : null
              )}
            </div>
          </div>

          <nav aria-label="Quick links">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["About Us", "/about"],
                ["All Courses", "/courses"],
                ["Our Faculty", "/faculty"],
                ["Results", "/results"],
                ["Admission Process", "/admission"],
                ["Student Enquiry", "/enquire"],
                ["AI Admission Assistant", "/chat"],
              ].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-navy-200 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Courses">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Our Courses</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {courseLinks.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-navy-200 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Contact Us</h3>
            <ul className="mt-4 space-y-3 text-sm text-navy-200">
              {contact && (
                <>
                  <li className="flex gap-2.5">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent-400" />
                    <span>{contact.full_address}</span>
                  </li>
                  <li className="flex gap-2.5">
                    <Phone className="h-4 w-4 mt-0.5 shrink-0 text-accent-400" />
                    <a href={`tel:${contact.phone_display.replace(/\s/g, "")}`} className="hover:text-white">
                      {contact.phone_display}
                    </a>
                  </li>
                  <li className="flex gap-2.5">
                    <Mail className="h-4 w-4 mt-0.5 shrink-0 text-accent-400" />
                    <a href={`mailto:${contact.email}`} className="hover:text-white break-all">
                      {contact.email}
                    </a>
                  </li>
                  <li className="flex gap-2.5">
                    <Clock className="h-4 w-4 mt-0.5 shrink-0 text-accent-400" />
                    <span>{contact.office_hours}</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-navy-200">
          <p>© {new Date().getFullYear()} EduRise Academy. All rights reserved.</p>
          <p>Sample demo content — replace with the institute&apos;s real details before launch.</p>
        </div>
      </div>
    </footer>
  );
}
