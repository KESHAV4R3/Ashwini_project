"use client";
import styles from "./ClaimCard.module.css";

const STATUS_ICONS = {
  verified: "✓",
  inaccurate: "⚠",
  false: "✕",
};

const STATUS_LABELS = {
  verified: "Verified",
  inaccurate: "Inaccurate",
  false: "Not Found / False",
};

export default function ClaimCard({ claim, status, explanation, correction, source, index }) {
  const icon = STATUS_ICONS[status] || "?";
  const label = STATUS_LABELS[status] || status;

  return (
    <article className={`${styles.card} ${styles[status]}`} aria-label={`Claim ${index + 1}`}>
      <div className={styles.header}>
        <p className={styles.claim}>&ldquo;{claim}&rdquo;</p>
        <span className={`${styles.badge} ${styles[status]}`} role="status">
          {icon} {label}
        </span>
      </div>

      {explanation && <p className={styles.explanation}>{explanation}</p>}

      {correction && (
        <div className={styles.correction}>
          <span className={styles.correctionLabel}>Correction:</span>
          {correction}
        </div>
      )}

      {source && source !== "null" && (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.source}
          aria-label="View source"
        >
          ↗ View source
        </a>
      )}
    </article>
  );
}
