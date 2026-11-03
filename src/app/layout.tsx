import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Montserrat, Onest, Unbounded } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { HERO_IMAGE } from "@/lib/demo-data";
import "./globals.css";

// cyrillic-ext is needed for the Mongolian letters Ө and Ү.
const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
});

// Unbounded has no Mongolian "Ү", so Montserrat (a similar geometric face)
// supplies just that letter; see --font-display in globals.css.
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  display: "swap",
  adjustFontFallback: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["cyrillic", "cyrillic-ext"],
  display: "swap",
  preload: false,
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Монголын second hand дэлгүүрүүд нэг дор`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["second hand", "vintage хувцас", "thrift", "Улаанбаатар", "хувцасны дэлгүүр"],
  openGraph: {
    type: "website",
    locale: "mn_MN",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: HERO_IMAGE, width: 1400, height: 1800, alt: SITE_NAME }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0f1f17",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="mn" data-scroll-behavior="smooth" className={`${onest.variable} ${unbounded.variable} ${montserrat.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
