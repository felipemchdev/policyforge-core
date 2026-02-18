import type { Metadata } from "next";
import { IBM_Plex_Mono, Sora } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PolicyForge App",
  description: "Recruiter-facing policy evaluation demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${sora.variable} ${ibmPlexMono.variable} min-h-screen antialiased`}>
        <SiteHeader />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
