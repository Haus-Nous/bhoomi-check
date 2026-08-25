import type { Metadata } from "next";
import "./globals.css";
import "./verification.css";
import "./guidance.css";
import "./locale.css";
import { CaseProvider } from "@/components/case-context";
import { LocaleProvider } from "@/components/locale-context";
import { Notice, SiteFooter, SiteHeader } from "@/components/shell";
export const metadata: Metadata = { title: "BhoomiCheck | Understand your land record", description: "Independent synthetic land-record assistance prototype." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><LocaleProvider><CaseProvider><SiteHeader /><Notice />{children}<SiteFooter /></CaseProvider></LocaleProvider></body></html>; }
