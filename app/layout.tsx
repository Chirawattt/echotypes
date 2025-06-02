import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Or your preferred base font
import "./globals.css";

const inter = Inter({ subsets: ["latin"] }); // Example base font

export const metadata: Metadata = {
  title: "EchoTypes",
  description: "เกมฝึกคำศัพท์ภาษาอังกฤษ",
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
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#101010" />
        <meta name="description" content="เกมฝึกคำศัพท์ภาษาอังกฤษ" />
        <meta name="keywords" content="EchoTypes, เกมฝึกคำศัพท์, ภาษาอังกฤษ, การศึกษา, เกมออนไลน์" />
        <meta name="author" content="Your Name or Company" />
        <meta property="og:title" content="EchoTypes" />
        <meta property="og:description" content="เกมฝึกคำศัพท์ภาษาอังกฤษ" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://echotypes.example.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EchoTypes" />
        <meta name="twitter:description" content="เกมฝึกคำศัพท์ภาษาอังกฤษ" />
        <meta name="twitter:image" content="/og-image.png" />
        <meta name="twitter:site" content="@yourtwitterhandle" />
        <meta name="twitter:creator" content="@yourtwitterhandle" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
