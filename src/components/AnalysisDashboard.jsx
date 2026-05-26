import React from "react";
import {
  Sparkles,
  Users,
  BookOpen,
  Trophy,
  Activity,
  Hash,
  Compass,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react";

export default function AnalysisDashboard({ data }) {
  if (!data) return null;

  const {
    title,
    authors,
    abstract_summary,
    key_contributions,
    methodology,
    keywords,
    future_work
  } = data;

  return (
    <div className="animate-fade-in" style={styles.dashboardContainer}>
      
      {/* Top Row: Title Card & Authors Card */}
      <div style={styles.row}>
        {/* 1. TITLE CARD */}
        <div className="glass-card" style={{ ...styles.card, flex: 2, minWidth: "300px" }}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBadge, background: "rgba(99, 102, 241, 0.12)" }}>
              <Sparkles size={20} style={{ color: "var(--accent-primary)" }} />
            </div>
            <span style={styles.cardLabel}>Document Title</span>
          </div>
          <h2 style={styles.documentTitle}>{title || "Untitled Paper"}</h2>
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <Layers size={14} style={{ color: "var(--text-muted)" }} />
              <span>Research Article</span>
            </div>
            <div style={styles.metaItem}>
              <Calendar size={14} style={{ color: "var(--text-muted)" }} />
              <span>Parsed Successfully</span>
            </div>
          </div>
        </div>

        {/* 2. AUTHORS CARD */}
        <div className="glass-card" style={{ ...styles.card, flex: 1, minWidth: "250px" }}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBadge, background: "rgba(20, 184, 166, 0.12)" }}>
              <Users size={20} style={{ color: "var(--accent-teal)" }} />
            </div>
            <span style={styles.cardLabel}>Research Authors</span>
          </div>
          <div style={styles.authorsList}>
            {authors && authors.length > 0 ? (
              authors.map((author, index) => (
                <div key={index} style={styles.authorItem}>
                  <div className="avatar-initial">
                    {author.trim().charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.authorName}>{author.trim()}</span>
                </div>
              ))
            ) : (
              <span style={styles.emptyText}>No authors specified</span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row: Abstract Summary */}
      {/* 3. ABSTRACT SUMMARY */}
      <div className="glass-card animate-fade-in" style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={{ ...styles.iconBadge, background: "rgba(168, 85, 247, 0.12)" }}>
            <BookOpen size={20} style={{ color: "var(--accent-secondary)" }} />
          </div>
          <span style={styles.cardLabel}>Abstract Summary</span>
        </div>
        <p style={styles.abstractText}>{abstract_summary}</p>
      </div>

      {/* Main Grid: Contributions, Methodology, Keywords, Future Work */}
      <div style={styles.grid}>
        
        {/* 4. KEY CONTRIBUTIONS */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBadge, background: "rgba(99, 102, 241, 0.12)" }}>
              <Trophy size={18} style={{ color: "var(--accent-primary)" }} />
            </div>
            <span style={styles.cardLabel}>Key Contributions</span>
          </div>
          <ul style={styles.list}>
            {key_contributions && key_contributions.length > 0 ? (
              key_contributions.map((contribution, index) => (
                <li key={index} style={styles.listItem}>
                  <div style={styles.bulletDot} />
                  <span style={styles.listText}>{contribution}</span>
                </li>
              ))
            ) : (
              <span style={styles.emptyText}>No contributions found</span>
            )}
          </ul>
        </div>

        {/* 5. METHODOLOGY */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBadge, background: "rgba(20, 184, 166, 0.12)" }}>
              <Activity size={18} style={{ color: "var(--accent-teal)" }} />
            </div>
            <span style={styles.cardLabel}>Methodology (Simple Terms)</span>
          </div>
          <p style={styles.methodologyText}>{methodology}</p>
        </div>

        {/* 6. KEYWORDS */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBadge, background: "rgba(168, 85, 247, 0.12)" }}>
              <Hash size={18} style={{ color: "var(--accent-secondary)" }} />
            </div>
            <span style={styles.cardLabel}>Subject Keywords</span>
          </div>
          <div style={styles.keywordsContainer}>
            {keywords && keywords.length > 0 ? (
              keywords.map((keyword, index) => (
                <span key={index} className="tag-badge">
                  {keyword}
                </span>
              ))
            ) : (
              <span style={styles.emptyText}>No keywords identified</span>
            )}
          </div>
        </div>

        {/* 7. FUTURE WORK */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={{ ...styles.iconBadge, background: "rgba(99, 102, 241, 0.12)" }}>
              <Compass size={18} style={{ color: "var(--accent-primary)" }} />
            </div>
            <span style={styles.cardLabel}>Suggested Future Work</span>
          </div>
          <ul style={styles.list}>
            {future_work && future_work.length > 0 ? (
              future_work.map((work, index) => (
                <li key={index} style={styles.listItem}>
                  <ArrowRight size={14} style={styles.futureArrow} />
                  <span style={styles.listText}>{work}</span>
                </li>
              ))
            ) : (
              <span style={styles.emptyText}>No future directions specified</span>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "24px",
    width: "100%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    width: "100%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    border: "1px solid var(--glass-border)",
    background: "rgba(15, 23, 42, 0.5)",
    transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  iconBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: "0.78rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-secondary)",
  },
  documentTitle: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.65rem",
    fontWeight: "800",
    color: "#fff",
    lineHeight: "1.25",
  },
  metaRow: {
    display: "flex",
    gap: "16px",
    marginTop: "auto",
    paddingTop: "8px",
    borderTop: "1px solid var(--glass-border)",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  authorsList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxHeight: "180px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  authorItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  authorName: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "var(--text-primary)",
  },
  abstractText: {
    fontSize: "0.98rem",
    lineHeight: "1.6",
    color: "#e2e8f0",
  },
  list: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  bulletDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--accent-primary)",
    boxShadow: "0 0 8px var(--accent-primary)",
    marginTop: "8px",
    flexShrink: 0,
  },
  listText: {
    fontSize: "0.88rem",
    lineHeight: "1.45",
    color: "var(--text-secondary)",
  },
  methodologyText: {
    fontSize: "0.9rem",
    lineHeight: "1.55",
    color: "var(--text-secondary)",
  },
  keywordsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  futureArrow: {
    color: "var(--accent-primary)",
    marginTop: "3px",
    flexShrink: 0,
  },
  emptyText: {
    fontSize: "0.82rem",
    color: "var(--text-muted)",
    fontStyle: "italic",
  },
};
