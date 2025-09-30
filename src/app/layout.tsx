"use client";

import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { usePathname } from "next/navigation";

const nunito = Nunito({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideLayout = pathname === "/process"; 

  return (
    <html lang="en">
      <body className={`${nunito.variable} antialiased`}>
        {!hideLayout && <Header />}
        {children}
        {!hideLayout && <Footer />}
      </body>
    </html>
  );
}
