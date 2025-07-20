import type { Metadata, Viewport } from "next";
import { Inter, Caveat_Brush } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header";
import { AuthProvider } from "@/providers/AuthContext";

// Configure fonts
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const caveatBrush = Caveat_Brush({ 
  subsets: ["latin"],
  weight: "400",
  variable: "--font-caveat-brush",
  display: "swap"
});

export const metadata: Metadata = {
  title: "EchoTypes",
  description: "EchoTypes - A game to practice English vocabulary.",
  keywords: "EchoTypes, เกมฝึกคำศัพท์, ภาษาอังกฤษ, การศึกษา, เกมออนไลน์",
  authors: [{ name: "EchoTypes Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101010",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Playpen Sans Thai - external font for Thai language support */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playpen+Sans+Thai:wght@100..800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        inter.variable, 
        caveatBrush.variable, 
        " bg-[#101010] text-white font-sans"
      )}>
        <AuthProvider>
          <Header />
          <main className="relative min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
