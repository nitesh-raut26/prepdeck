import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "highlight.js/styles/github.css";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getNav, getSearchIndex } from "@/lib/content";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PrepDeck — Zero to FAANG Learning Path",
    template: "%s · PrepDeck",
  },
  description:
    "A thirteen-level software engineering learning path — computer basics, programming, DSA, LLD, HLD, backend, frontend, databases, cloud, AI and career — built from a real engineering portfolio.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const nav = getNav();
  const searchIndex = getSearchIndex();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-bg text-ink">
        <AppShell nav={nav} searchIndex={searchIndex}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
