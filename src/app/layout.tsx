// app/layout.tsx

import type { Metadata } from "next";
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import '@xyflow/react/dist/style.css';

import { ThemeProvider } from "@/contexts/themeContext";

import { ReactFlowProvider } from "@xyflow/react";
import { Toaster } from "sonner";


// Load fonts with subsets (Latin for performance)
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-serif" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

// ✅ Metadata for SEO
export const metadata: Metadata = {
  title: " :D JSON Visualizer and formatter",
  description: "Turn raw JSON into interactive visual graphs with Fromarter. Human-readable, searchable, and explorable.",
  keywords: ["JSON", "visualizer", "React Flow", "graph tool", "data visualization"],
  authors: [{ name: "Akinola Bright - Brightdotdev" }],
  openGraph: {
    title: "Fromarter – JSON Visualizer",
    description: "Make JSON data human-readable and interactive.",
    // url: "https://fromarter.app", // replace when you deploy
    siteName: "Brightdotdev-Json-Fromarter",
    // images: [
    //   {
    //     url: "/og-image.png", // add later
    //     width: 1200,
    //     height: 630,
    //     alt: "Fromarter Preview",
    //   },
    // ],
    locale: "en_US",
    type: "website",
  },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Fromarter – JSON Visualizer",
  //   description: "Make JSON data human-readable and interactive.",
  //   images: ["/og-image.png"],
  // },
  // icons: {
  //   icon: "/favicon.ico",
  // },
};

// ✅ Root Layout with semantic HTML
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>    
    <head>

<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0f172a" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />


    </head>
    
      <body className="h-screen w-screeen  bg-background text-foreground antialiased font-mono flex flex-col  items-center justify-between gap-16 overflow-x-hidden">
         <ThemeProvider defaultTheme="system">
        
        
          <ReactFlowProvider>

          {children}
          <Toaster />
          </ReactFlowProvider>
        {/* <Footer /> */}
        
         </ThemeProvider>
      </body>
    </html>
  );
}
