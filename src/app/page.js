"use client";

import { useState, useRef, useCallback } from "react";
import ClaimCard from "@/components/ClaimCard/ClaimCard";
import styles from "./page.module.css";

const STAGES = {
  IDLE: "idle",
  UPLOADING: "uploading",
  EXTRACTING: "extracting",
  VERIFYING: "verifying",
  DONE: "done",
  ERROR: "error",
};

const STAGE_MESSAGES = {
  uploading: "Reading your PDF...",
  extracting: "AI is identifying verifiable claims...",
  verifying: "Cross-referencing claims against live web data...",
};

export default function HomePage() {
  const [stage, setStage] = useState(STAGES.IDLE);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      setStage(STAGES.ERROR);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File is too large. Maximum size is 10MB.");
      setStage(STAGES.ERROR);
      return;
    }

    setFileName(file.name);
    setError("");
    setResults([]);
    setSummary(null);
    setFilter("all");

    setStage(STAGES.UPLOADING);
    await new Promise((r) => setTimeout(r, 600));
    setStage(STAGES.EXTRACTING);
    await new Promise((r) => setTimeout(r, 800));
    setStage(STAGES.VERIFYING);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResults(data.results);
      setSummary(data.summary);
      setStage(STAGES.DONE);
    } catch (err) {
      setError(err.message);
      setStage(STAGES.ERROR);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleReset = () => {
    setStage(STAGES.IDLE);
    setResults([]);
    setSummary(null);
    setError("");
    setFileName("");
    setFilter("all");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isLoading = [STAGES.UPLOADING, STAGES.EXTRACTING, STAGES.VERIFYING].includes(stage);

  const filteredResults =
    filter === "all" ? results : results.filter((r) => r.status === filter);

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>⚡</span>
          <span className={styles.logoText}>FactGuard AI</span>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.githubLink}
          aria-label="GitHub"
        >
          GitHub ↗
        </a>
      </header>

      {/* Hero */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} aria-hidden="true" />
          AI-Powered Fact Verification
        </div>
        <h1 id="hero-title" className={styles.heroTitle}>
          The Truth Layer
          <span className={styles.heroTitleAccent}> for your documents</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Upload any PDF. Our AI extracts every verifiable claim, cross-references it against
          live web data, and flags what&apos;s false, outdated, or misleading — in seconds.
        </p>
      </section>

      {/* Upload Zone */}
      {stage === STAGES.IDLE || stage === STAGES.ERROR ? (
        <section
          className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ""} ${
            stage === STAGES.ERROR ? styles.hasError : ""
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload PDF for fact-checking"
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          id="upload-zone"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className={styles.fileInput}
            onChange={handleInputChange}
            id="pdf-file-input"
            aria-label="Select PDF file"
          />
          <div className={styles.uploadIconWrapper} aria-hidden="true">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 16V4m0 0L8 8m4-4l4 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className={styles.uploadTitle}>
            {dragOver ? "Drop your PDF here" : "Drag & drop your PDF"}
          </p>
          <p className={styles.uploadSub}>or click to browse · Max 10MB</p>
          {stage === STAGES.ERROR && (
            <p className={styles.errorMsg} role="alert">{error}</p>
          )}
        </section>
      ) : null}

      {/* Loading State */}
      {isLoading && (
        <section className={styles.loadingSection} aria-live="polite" aria-label="Processing status">
          <div className={styles.loadingFile}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M14 2v6h6" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{fileName}</span>
          </div>

          <div className={styles.stageList} role="list">
            {[
              { key: STAGES.UPLOADING, label: "Reading PDF" },
              { key: STAGES.EXTRACTING, label: "Extracting Claims" },
              { key: STAGES.VERIFYING, label: "Live Web Verification" },
            ].map(({ key, label }) => {
              const stageOrder = [STAGES.UPLOADING, STAGES.EXTRACTING, STAGES.VERIFYING];
              const currentIdx = stageOrder.indexOf(stage);
              const itemIdx = stageOrder.indexOf(key);
              const isDone = itemIdx < currentIdx;
              const isActive = itemIdx === currentIdx;

              return (
                <div
                  key={key}
                  className={`${styles.stageItem} ${isActive ? styles.stageActive : ""} ${
                    isDone ? styles.stageDone : ""
                  }`}
                  role="listitem"
                >
                  <span className={styles.stageIcon} aria-hidden="true">
                    {isDone ? "✓" : isActive ? <span className={styles.spinner} /> : "○"}
                  </span>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          <p className={styles.stageMsg}>{STAGE_MESSAGES[stage]}</p>
        </section>
      )}

      {/* Results */}
      {stage === STAGES.DONE && summary && (
        <section className={styles.resultsSection} aria-labelledby="results-title">
          {/* Summary Stats */}
          <div className={styles.summaryBar}>
            <h2 id="results-title" className={styles.summaryTitle}>
              Fact-Check Report
            </h2>
            <p className={styles.summaryFile}>{fileName}</p>
            <div className={styles.statsGrid} role="list">
              <div className={styles.statCard} style={{ "--accent": "#22c55e" }} role="listitem">
                <span className={styles.statNum}>{summary.verified}</span>
                <span className={styles.statLabel}>Verified</span>
              </div>
              <div className={styles.statCard} style={{ "--accent": "#f59e0b" }} role="listitem">
                <span className={styles.statNum}>{summary.inaccurate}</span>
                <span className={styles.statLabel}>Inaccurate</span>
              </div>
              <div className={styles.statCard} style={{ "--accent": "#ef4444" }} role="listitem">
                <span className={styles.statNum}>{summary.false}</span>
                <span className={styles.statLabel}>False</span>
              </div>
              <div className={styles.statCard} style={{ "--accent": "#a1a1aa" }} role="listitem">
                <span className={styles.statNum}>{summary.total}</span>
                <span className={styles.statLabel}>Total Claims</span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className={styles.filterBar} role="tablist" aria-label="Filter claims by status">
            {["all", "verified", "inaccurate", "false"].map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
                onClick={() => setFilter(f)}
                id={`filter-${f}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className={styles.filterCount}>
                  {f === "all"
                    ? summary.total
                    : summary[f] ?? 0}
                </span>
              </button>
            ))}
          </div>

          {/* Claims List */}
          <div className={styles.claimsList} aria-live="polite">
            {filteredResults.length === 0 ? (
              <p className={styles.noResults}>No claims match this filter.</p>
            ) : (
              filteredResults.map((r, i) => (
                <ClaimCard key={i} index={i} {...r} />
              ))
            )}
          </div>

          {/* Reset */}
          <button
            className={styles.resetBtn}
            onClick={handleReset}
            id="check-another-btn"
          >
            ↑ Check Another Document
          </button>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Built for CogCulture Assessment · Powered by Gemini AI + Tavily Search</p>
      </footer>
    </main>
  );
}
