import type { Metadata } from "next";
import "./globals.css";
import "./verification.css";
import "./guidance.css";
import { CaseProvider } from "@/components/case-context";
import { Notice, SiteHeader } from "@/components/shell";
export const metadata: Metadata = { title: "BhoomiCheck | Understand your land record", description: "Independent synthetic land-record assistance prototype." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><CaseProvider><SiteHeader /><Notice />{children}<footer>© 2026 BhoomiCheck · Independent prototype · No real government records are used.</footer></CaseProvider></body></html>; }
