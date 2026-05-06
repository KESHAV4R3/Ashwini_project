import "./globals.css";

export const metadata = {
  title: "FactGuard AI — Automated Fact-Checking",
  description:
    "Upload a PDF and let AI verify every claim against live web data. Instantly flag misinformation, outdated stats, and hallucinated figures.",
  keywords: ["fact-checking", "AI", "PDF", "misinformation", "claim verification"],
  openGraph: {
    title: "FactGuard AI — Automated Fact-Checking",
    description: "Upload a PDF and let AI verify every claim against live web data.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
