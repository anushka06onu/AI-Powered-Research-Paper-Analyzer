import React, { useState } from "react";
import { FileText, Maximize2, Minimize2, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function DocumentPreview({ file }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!file) return null;

  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        ...styles.container,
        height: isExpanded ? "calc(100vh - 120px)" : "100%",
        flexGrow: isExpanded ? 0 : 1,
        minHeight: isExpanded ? "auto" : "450px",
        gridColumn: isExpanded ? "1 / -1" : "auto",
        transition: "height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleWrapper}>
          <FileText size={18} style={{ color: "var(--accent-primary)" }} />
          <h3 style={styles.title}>Document Viewer</h3>
        </div>
        <div style={styles.actions}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={styles.actionBtn}
            title={isExpanded ? "Collapse View" : "Expand View"}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* PDF View Container */}
      <div style={styles.viewerBody}>
        {!hasError ? (
          <iframe
            src={`${file.url}#toolbar=0&navpanes=0`}
            title="PDF Preview"
            style={styles.iframe}
            onError={() => setHasError(true)}
            onLoad={(e) => {
              // Sometimes browsers block loading local blob URLs in iframes, handle this gracefully
              if (!e.target.src) {
                setHasError(true);
              }
            }}
          />
        ) : (
          <div style={styles.fallbackBox}>
            <AlertCircle size={40} style={{ color: "var(--accent-secondary)", marginBottom: "16px" }} />
            <h4 style={styles.fallbackTitle}>Unable to embed PDF directly</h4>
            <p style={styles.fallbackText}>
              Your browser does not support inline PDF viewing, or has blocked embedding. You can still use the Full AI Analysis Dashboard on the right!
            </p>
            <a
              href={file.url}
              download={file.name}
              className="btn-secondary"
              style={{ marginTop: "16px", textDecoration: "none", fontSize: "0.85rem" }}
            >
              Download PDF Instead
            </a>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div style={styles.footer}>
        <span style={styles.footerText}>
          Viewing: <strong>{file.name}</strong>
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    padding: "0",
    overflow: "hidden",
    border: "1px solid var(--glass-border)",
    background: "rgba(10, 15, 30, 0.45)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid var(--glass-border)",
    background: "rgba(15, 23, 42, 0.4)",
  },
  titleWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#fff",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  actionBtn: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid var(--glass-border)",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "rgba(255, 255, 255, 0.1)",
      color: "#fff",
    },
  },
  viewerBody: {
    flexGrow: 1,
    position: "relative",
    background: "#080a14",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
    background: "#0d0e15",
  },
  fallbackBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 24px",
    textAlign: "center",
    maxWidth: "340px",
  },
  fallbackTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#fff",
    marginBottom: "8px",
  },
  fallbackText: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
  },
  footer: {
    padding: "10px 20px",
    borderTop: "1px solid var(--glass-border)",
    background: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    alignItems: "center",
  },
  footerText: {
    fontSize: "0.78rem",
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
};
