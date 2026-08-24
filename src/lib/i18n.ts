type Translation = { nav: Record<"home" | "dashboard" | "documents" | "family" | "verification" | "survey" | "action" | "timeline", string>; notice: string; cta: Record<"check" | "how" | "review" | "continue", string>; labels: Record<"synthetic" | "viewDetails" | "confidence" | "evidence" | "backToCase" | "mock", string>; caseStates: Record<"loading" | "notFoundTitle" | "notFoundDetail" | "errorTitle" | "errorDetail" | "retry", string> };
const en: Translation = {
  nav: { home: "Home", dashboard: "My case", documents: "Documents", family: "Family", verification: "Check records", survey: "Survey record", action: "Next step", timeline: "Timeline" },
  notice: "Independent prototype · Synthetic demo data only · Not legal advice or a government service",
  cta: { check: "Check My Land Record", how: "See How It Works", review: "Review survey record", continue: "Continue" },
  labels: { synthetic: "Synthetic demo", viewDetails: "View details", confidence: "Confidence", evidence: "Evidence", backToCase: "Back to my case", mock: "Mock only — nothing will be submitted" },
  caseStates: { loading: "Loading your synthetic case…", notFoundTitle: "Case not found", notFoundDetail: "This synthetic case does not exist. Choose a demo case or create a new one.", errorTitle: "We could not load this section", errorDetail: "Please try again. Your case has not been changed.", retry: "Try again" }
};

export const copy: Record<"en" | "hi", Translation> = {
  en,
  hi: {
    nav: { home: "होम", dashboard: "मेरा केस", documents: "दस्तावेज़", family: "परिवार", verification: "रिकॉर्ड जाँचें", survey: "सर्वे रिकॉर्ड", action: "अगला कदम", timeline: "समयरेखा" },
    notice: "स्वतंत्र प्रोटोटाइप · केवल सिंथेटिक डेमो डेटा · कानूनी सलाह या सरकारी सेवा नहीं",
    cta: { check: "भूमि रिकॉर्ड जाँचें", how: "कैसे काम करता है", review: "सर्वे रिकॉर्ड देखें", continue: "आगे बढ़ें" },
    labels: { synthetic: "सिंथेटिक डेमो", viewDetails: "विवरण देखें", confidence: "विश्वास", evidence: "साक्ष्य", backToCase: "मेरे केस पर लौटें", mock: "केवल मॉक — कुछ भी जमा नहीं होगा" },
    caseStates: { loading: "आपका सिंथेटिक केस लोड हो रहा है…", notFoundTitle: "केस नहीं मिला", notFoundDetail: "यह सिंथेटिक केस मौजूद नहीं है। डेमो केस चुनें या नया केस बनाएं।", errorTitle: "यह अनुभाग लोड नहीं हो सका", errorDetail: "कृपया पुनः प्रयास करें। आपके केस में कोई बदलाव नहीं हुआ है।", retry: "पुनः प्रयास करें" }
  }
};
export type Locale = keyof typeof copy;
export const t = (locale: Locale = "en") => copy[locale];
