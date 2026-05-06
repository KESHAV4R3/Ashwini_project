# FactGuard AI — Automated Fact-Checking Web App

> **CogCulture Assessment · Part 2**
> A full-stack Next.js web app that extracts verifiable claims from PDFs and cross-references them against live web data using Google Gemini AI + Tavily Search.

🔗 **Live Demo:** `<add your Vercel URL here>`

---

## What It Does

1. **Upload** — Drag & drop any PDF (marketing reports, research papers, news articles)
2. **Extract** — Gemini AI identifies specific, verifiable claims (stats, dates, financial figures)
3. **Verify** — Each claim is searched against the live web via Tavily AI Search
4. **Report** — Claims are flagged as:
   - ✅ **Verified** — matches current data
   - ⚠️ **Inaccurate** — outdated or partially wrong
   - ❌ **False** — contradicts evidence or no evidence found

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript (ES2024) |
| Styling | CSS Modules (custom dark theme) |
| AI Engine | Google Gemini 1.5 Flash |
| Search API | Tavily AI |
| PDF Processing | `pdf-parse` |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API key
- A Tavily API key

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd ashwani
npm install
```

### 2. Get API Keys

#### Google Gemini API Key
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy your key

#### Tavily API Key
1. Go to [https://tavily.com](https://tavily.com)
2. Sign up for a free account (1,000 free searches/month)
3. Go to your dashboard → copy your **API Key**

### 3. Configure Environment

Create a `.env.local` file in the root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
src/
├── app/
│   ├── api/check/route.js     # Core fact-check API endpoint
│   ├── globals.css            # Global CSS variables
│   ├── layout.js              # Root layout + SEO metadata
│   ├── page.js                # Main UI (upload, results)
│   └── page.module.css        # Page styles
├── components/
│   └── ClaimCard/
│       ├── ClaimCard.js       # Per-claim result card
│       └── ClaimCard.module.css
└── lib/
    ├── ai.js                  # Gemini: claim extraction + verification
    ├── search.js              # Tavily: live web search
    └── pdf.js                 # pdf-parse wrapper
```

---

## Deployment (Vercel)

```bash
npm install -g vercel
vercel
```

When prompted, add your environment variables:
- `GEMINI_API_KEY`
- `TAVILY_API_KEY`

Or add them via the Vercel dashboard → Project Settings → Environment Variables.

---

## Evaluation

This app is designed to handle a "Trap Document" containing intentional lies and outdated statistics:
- The Gemini extraction agent is tuned to find **specific, numerical, attributed claims**
- The Tavily search fetches **fresh, live web data** — not cached results
- The verification agent explicitly checks for **recency** and flags outdated figures as "Inaccurate" rather than "False"

---

## License

MIT
Last Update: Wed May  6 18:28:54 IST 2026
