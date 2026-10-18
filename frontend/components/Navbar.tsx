"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Menu, X, PhoneCall } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/courses", label: "Courses" },
  { href: "/faculty", label: "Faculty" },
  { href: "/results", label: "Results" },
  { href: "/admission", label: "Admission" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="EduRise Academy home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900">
            <GraduationCap className="h-6 w-6 text-accent-400" />
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-navy-900">
              EduRise Academy
            </span>
            <span className="block text-[11px] font-medium text-slate-500">
              Learn Today. Lead Tomorrow.
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active ? "text-brand-700 bg-brand-50" : "text-slate-600 hover:text-navy-900 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Link
            href="/enquire"
            className="inline-flex items-center gap-2 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-accent-600"
          >
            <PhoneCall className="h-4 w-4" />
            Book a Free Counselling Session
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-navy-900 hover:bg-slate-100 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === l.href ? "text-brand-700 bg-brand-50" : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/enquire"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white"
          >
            <PhoneCall className="h-4 w-4" />
            Book a Free Counselling Session
          </Link>
        </nav>
      )}
    </header>
  );
}
