import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppWidget } from "@/components/layout/WhatsAppWidget";
import { Analytics } from "@/components/Analytics";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";
import { SITE_URL } from "@/content/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dees Language Lounge",
    template: "%s | Dees Language Lounge",
  },
  description:
    "Live online language classes in French, Spanish, German and IELTS English. Book a free level assessment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} dark`}>
      <head>
        {/* Material Symbols Outlined — icon set used across the design. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="canvas-texture min-h-screen bg-canvas font-sans text-ink antialiased">
        <OrganizationJsonLd />
        <SiteHeader />
        {children}
        <SiteFooter />
        <WhatsAppWidget />
        <Analytics />
      </body>
    </html>
  );
}
