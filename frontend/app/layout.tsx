import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EduRise Academy — Learn Today. Lead Tomorrow.",
    template: "%s | EduRise Academy",
  },
  description:
    "EduRise Academy offers expert coaching for JEE, NEET, CUET, board exams, foundation courses and coding — with small batches, personal mentorship and transparent fees.",
  keywords: ["coaching institute", "JEE coaching", "NEET preparation", "CUET", "board exams", "coding classes"],
  openGraph: {
    type: "website",
    siteName: "EduRise Academy",
    title: "EduRise Academy — Learn Today. Lead Tomorrow.",
    description:
      "Expert coaching for JEE, NEET, CUET, boards and coding with small batches and personal mentorship.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EduRise Academy — Learn Today. Lead Tomorrow.",
    description: "Expert coaching for JEE, NEET, CUET, boards and coding.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
