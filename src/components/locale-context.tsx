"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { copy, type Locale } from "@/lib/i18n";
const LocaleContext = createContext<{ locale: Locale; setLocale: (locale: Locale) => void } | null>(null);
export function LocaleProvider({ children }: { children: ReactNode }) { const [locale, setLocale] = useState<Locale>(() => { if (typeof window === "undefined") return "en"; const saved = window.localStorage.getItem("bhoomi-check-locale"); return saved === "hi" || saved === "en" ? saved : "en"; }); useEffect(() => { document.documentElement.lang = locale; window.localStorage.setItem("bhoomi-check-locale", locale); }, [locale]); return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>; }
export function useLocale() { const context = useContext(LocaleContext); if (!context) throw new Error("useLocale must be used inside LocaleProvider"); return context; }
export function useTranslation() { const { locale } = useLocale(); return copy[locale]; }
