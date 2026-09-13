import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { ReactLenis } from 'lenis/react'

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SkillTrail — Turn What You Build Into Stories Worth Sharing",
  description:
    "SkillTrail helps developers turn the things they build, learn, and discover into stories worth sharing. Join the first founding users and help shape what comes next.",
  openGraph: {
    title: "SkillTrail — Turn What You Build Into Stories Worth Sharing",
    description:
      "SkillTrail helps developers turn the things they build, learn, and discover into stories worth sharing. Join the first founding users and help shape what comes next.",
    url: "https://skilltrail.nandux.dev",
    siteName: "SkillTrail",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillTrail — Turn What You Build Into Stories Worth Sharing",
    description:
      "SkillTrail helps developers turn the things they build, learn, and discover into stories worth sharing.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ReactLenis root options={{ smoothWheel: true, lerp: 0.1 }}>
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        dmSans.variable,
        fraunces.variable,
        jetBrainsMono.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
    </ReactLenis>
  );
}
