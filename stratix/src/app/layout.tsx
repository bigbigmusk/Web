import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STRATIX — Strategic Intelligence for Global Market Expansion",
  description:
    "STRATIX is an AI strategic intelligence workspace that helps manufacturers, DTC brands, and consultants decode markets, map competitors, generate sales assets, and build outbound growth systems.",
  keywords: [
    "global expansion",
    "export strategy",
    "market entry",
    "competitor analysis",
    "B2B GTM",
    "AI sales assets",
  ],
  openGraph: {
    title: "STRATIX — Strategic Intelligence for Global Market Expansion",
    description: "Decode markets. Map competitors. Build global growth systems.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
