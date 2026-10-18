"use client";

import { useSearchParams } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import type { CourseSummary } from "@/lib/api";

export default function EnquireFormLoader({ courses }: { courses: CourseSummary[] }) {
  const params = useSearchParams();
  const courseParam = params.get("course") ?? undefined;
  const rawMessage = params.get("message") ?? undefined;
  let messageParam: string | undefined;
  if (rawMessage) {
    try {
      messageParam = decodeURIComponent(rawMessage);
    } catch {
      messageParam = rawMessage;
    }
  }
  const matched = courses.some((c) => c.name === courseParam);
  return (
    <EnquiryForm
      courses={courses}
      presetCourse={matched ? courseParam : courseParam === "General Enquiry" ? "General Enquiry" : undefined}
      presetMessage={messageParam}
    />
  );
}
