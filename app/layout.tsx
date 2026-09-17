import { DM_Sans, Fraunces, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(
				"h-full",
				"antialiased",
				dmSans.variable,
				fraunces.variable,
				jetBrainsMono.variable,
			)}
		>
			<body className="min-h-full flex flex-col">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
