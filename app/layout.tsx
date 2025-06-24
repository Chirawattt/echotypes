import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Or your preferred base font
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/header"; // Import the new Header

const inter = Inter({ subsets: ["latin"] }); // Example base font

export const metadata: Metadata = {
  title: "EchoTypes",
  description: "EchoTypes - A game to practice English vocabulary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Custom fonts moved to _document.tsx */}
        <title>EchoTypes</title>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />  
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#101010" />
        <meta name="description" content="เกมฝึกคำศัพท์ภาษาอังกฤษ" />
        <meta name="keywords" content="EchoTypes, เกมฝึกคำศัพท์, ภาษาอังกฤษ, การศึกษา, เกมออนไลน์" />
        <meta name="author" content="Your Name or Company" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Caveat+Brush&family=Playpen+Sans+Thai:wght@100..800&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(inter.className, "bg-[#101010] text-white")}>
        <Header />
        <main className="relative min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
