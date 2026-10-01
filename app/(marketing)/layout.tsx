import { ReactLenis } from "lenis/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
	metadataBase: new URL("https://skilltrail.nandux.dev"),
	title: "SkillTrail — Turn What You Build Into Stories Worth Sharing",
	description:
		"SkillTrail helps developers turn the things they build, learn, and discover into stories worth sharing. Join the first founding users and help shape what comes next.",
	openGraph: {
		title: "SkillTrail — Turn What You Build Into Stories Worth Sharing",
		description:
			"SkillTrail helps developers turn the things they build, learn, and discover into stories worth sharing.",
		url: "https://skilltrail.nandux.dev",
		siteName: "SkillTrail",
		type: "website",
		images: [
			{
				url: "/opengraph-image.png",
				width: 1200,
				height: 630,
				alt: "SkillTrail — Turn What You Build Into Stories Worth Sharing",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "SkillTrail — Turn What You Build Into Stories Worth Sharing",
		description:
			"SkillTrail helps developers turn the things they build, learn, and discover into stories worth sharing.",
		images: ["/opengraph-image.png"],
	},
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<ReactLenis root options={{ smoothWheel: true, lerp: 0.1 }}>
			{children}
		</ReactLenis>
	);
}
