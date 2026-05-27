import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://devmind.app"),
  title: "DevMind — Memory for your AI",
  description:
    "Persistent memory layer for AI coding assistants. Your AI finally remembers team decisions across sessions, tools, and teammates.",
  keywords: ["AI", "memory", "Claude Code", "Cursor", "MCP", "Walrus", "Sui"],
  icons: {
    icon: [
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
  },
  openGraph: {
    title: "DevMind — Memory for your AI",
    description:
      "Persistent memory layer for AI coding assistants. Your AI finally remembers team decisions across sessions, tools, and teammates.",
    url: "https://devmind.app",
    siteName: "DevMind",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "DevMind" }],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DevMind — Memory for your AI",
    description:
      "Persistent memory layer for AI coding assistants. Your AI finally remembers team decisions across sessions, tools, and teammates.",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
