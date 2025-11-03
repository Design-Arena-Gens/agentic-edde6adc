import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Nebula Studio — Mobile Astrophotography Control",
  description:
    "Capture, sequence, and stack deep-sky astrophotography frames with a touch-first control surface built for mobile observers.",
  metadataBase: new URL("https://agentic-edde6adc.vercel.app"),
  openGraph: {
    title: "Nebula Studio",
    description:
      "Remote-manage your rig, orchestrate capture sequences, and stack images directly from your phone.",
    type: "website",
    url: "https://agentic-edde6adc.vercel.app",
  },
  keywords: [
    "astrophotography",
    "image stacking",
    "deep sky",
    "mobile control",
    "nextjs",
    "react",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-950">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
