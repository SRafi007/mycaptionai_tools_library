import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PageViewTracker from "@/components/analytics/page-view-tracker";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyCaptionAI — AI Tools Directory",
    template: "%s | MyCaptionAI",
  },
  description:
    "Discover and compare the best AI tools for content creation, marketing, and productivity.",
  keywords: [
    "AI tools",
    "AI directory",
    "content creation",
    "AI writing",
    "AI marketing",
    "productivity tools",
    "MyCaptionAI",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MyCaptionAI",
    title: "MyCaptionAI — AI Tools Directory",
    description:
      "Discover and compare the best AI tools for content creation, marketing, and productivity.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyCaptionAI — AI Tools Directory",
    description:
      "Discover and compare the best AI tools for content creation, marketing, and productivity.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable}`}>
        <Header />
        <main style={{ paddingTop: "var(--header-height)", minHeight: "100vh" }}>
          {children}
        </main>
        <Footer />
        <PageViewTracker />
      </body>
    </html>
  );
}
