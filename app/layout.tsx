import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PageViewTracker from "@/components/analytics/page-view-tracker";
import { SITE_NAME, SITE_URL, absoluteUrl, DEFAULT_OG_IMAGE_PATH } from "@/lib/seo";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - AI Tools Directory`,
    template: `%s | ${SITE_NAME}`,
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
    SITE_NAME,
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - AI Tools Directory`,
    description:
      "Discover and compare the best AI tools for content creation, marketing, and productivity.",
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} - AI Tools Directory`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - AI Tools Directory`,
    description:
      "Discover and compare the best AI tools for content creation, marketing, and productivity.",
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/image/logo.png"),
  };

  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
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
