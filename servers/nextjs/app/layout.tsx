import type { Metadata } from "next";
import localFont from "next/font/local";
import { Manrope, Syne, Unbounded } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "./providers";
import MixpanelInitializer from "./MixpanelInitializer";
import { Toaster } from "@/components/ui/sonner";
import TailwindBrowserRuntime from "@/components/runtime/TailwindBrowserRuntime";
import { BridgeRedeemer } from "@/components/bridge/BridgeRedeemer";
const inter = localFont({
  src: [
    {
      path: "./fonts/Inter.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  preload: false,
  variable: "--font-inter",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  preload: false,
  variable: "--font-manrope",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  preload: false,
  variable: "--font-unbounded",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://work.clickdz.ai"),
  title: "SlidePro by ClickDz — AI Presentation Generator",
  description:
    "AI-powered presentation generator with 114 templates, custom layouts, and PDF/PPTX export. Part of the ClickDz workspace.",
  keywords: [
    "AI presentation generator",
    "SlidePro",
    "ClickDz",
    "data storytelling",
    "presentation generator",
    "AI data presentation",
    "professional slides",
  ],
  openGraph: {
    title: "SlidePro by ClickDz — AI Presentation Generator",
    description:
      "AI-powered presentation generator with 114 templates, custom layouts, and PDF/PPTX export. Part of the ClickDz workspace.",
    url: "https://work.clickdz.ai",
    siteName: "SlidePro",
    type: "website",
    locale: "en_US",
  },
  alternates: {
    canonical: "https://work.clickdz.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "SlidePro by ClickDz — AI Presentation Generator",
    description:
      "AI-powered presentation generator with 114 templates, custom layouts, and PDF/PPTX export. Part of the ClickDz workspace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${syne.variable} ${manrope.variable} ${unbounded.variable} antialiased`}
      >
        <BridgeRedeemer />
        <Providers>
          <MixpanelInitializer>

            {children}

          </MixpanelInitializer>
        </Providers>
        <TailwindBrowserRuntime />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
