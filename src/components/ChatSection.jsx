import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, Bot, User, Trash2 } from "lucide-react";

export default function ChatSection({ chatHistory, onSendMessage, isLoading, onClearHistory }) {
  const [question, setQuestion] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat port on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    onSendMessage(question.trim());
    setQuestion("");
  };

  const handleSuggestionClick = (suggestionText) => {
    if (isLoading) return;
    onSendMessage(suggestionText);
  };

  const suggestions = [
    "What are the main limitations of this paper?",
    "Explain the methodology in extremely simple terms.",
    "What is the practical real-world application of this research?",
    "Highlight the key data sources or benchmarks used.",
  ];

  return (
    <div className="glass-card animate-fade-in" style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <div style={{ ...styles.iconBadge, background: "rgba(168, 85, 247, 0.12)" }}>
            <MessageSquare size={18} style={{ color: "var(--accent-secondary)" }} />
          </div>
          <div>
            <h3 style={styles.title}>Academic Research Assistant</h3>
            <p style={styles.subtitle}>Ask direct questions about the research methodology, data, and conclusions.</p>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <button
            onClick={onClearHistory}
            style={styles.clearBtn}
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Suggestion Chips (Only show if history is empty) */}
      {chatHistory.length === 0 && (
        <div style={styles.suggestionsWrapper}>
          <span style={styles.suggestionLabel}>Suggested Questions:</span>
          <div style={styles.chipsContainer}>
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                style={styles.chip}
                disabled={isLoading}
              >
                <Sparkles size={12} style={{ color: "var(--accent-teal)" }} />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div style={styles.feed}>
        {chatHistory.length === 0 ? (
          <div style={styles.emptyFeed}>
            <Bot size={40} style={{ color: "var(--text-muted)", marginBottom: "12px" }} />
            <p style={styles.emptyText}>The assistant is ready. Ask any question to start analyzing.</p>
          </div>
        ) : (
          <div style={styles.messageList}>
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                style={{
                  ...styles.messageContainer,
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.role !== "user" && (
                  <div style={styles.avatarAi}>
                    <Bot size={14} style={{ color: "#fff" }} />
                  </div>
                )}
                <div
                  className={msg.role === "user" ? "message-user" : "message-ai"}
                  style={styles.bubble}
                >
                  <p style={{ margin: 0 }}>{msg.content}</p>
                </div>
                {msg.role === "user" && (
                  <div style={styles.avatarUser}>
                    <User size={14} style={{ color: "#fff" }} />
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Loading State */}
            {isLoading && (
              <div style={{ ...styles.messageContainer, justifyContent: "flex-start" }}>
                <div style={styles.avatarAi}>
                  <Bot size={14} style={{ color: "#fff" }} />
                </div>
                <div className="message-ai" style={{ ...styles.bubble, display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={styles.typingDot}></span>
                  <span style={{ ...styles.typingDot, animationDelay: "0.2s" }}></span>
                  <span style={{ ...styles.typingDot, animationDelay: "0.4s" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Chat Input form */}
      <form onSubmit={handleSubmit} style={styles.inputForm}>
        <input
          type="text"
          placeholder="Ask a question about this paper..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="input-text"
          style={styles.input}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="btn-primary"
          style={styles.sendBtn}
          disabled={!question.trim() || isLoading}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    background: "rgba(10, 15, 30, 0.4)",
    border: "1px solid var(--glass-border)",
    height: "500px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid var(--glass-border)",
    paddingBottom: "14px",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconBadge: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: "0.78rem",
    color: "var(--text-secondary)",
  },
  clearBtn: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fca5a5",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "rgba(239, 68, 68, 0.2)",
    },
  },
  suggestionsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  suggestionLabel: {
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    textAlign: "left",
  },
  chipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  chip: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--glass-border)",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "0.78rem",
    color: "var(--text-secondary)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s",
    ":hover": {
      background: "rgba(99, 102, 241, 0.08)",
      borderColor: "rgba(99, 102, 241, 0.25)",
      color: "#fff",
    },
  },
  feed: {
    flexGrow: 1,
    overflowY: "auto",
    borderRadius: "10px",
    padding: "8px 4px",
    background: "rgba(3, 4, 11, 0.2)",
  },
  emptyFeed: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "20px",
  },
  emptyText: {
    fontSize: "0.82rem",
    color: "var(--text-muted)",
    maxWidth: "280px",
    lineHeight: "1.4",
  },
  messageList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
    width: "100%",
  },
  avatarAi: {
    width: "26px",
    height: "26px",
    borderRadius: "6px",
    background: "linear-gradient(135deg, var(--accent-secondary) 0%, var(--accent-primary) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 2px 6px rgba(168, 85, 247, 0.3)",
  },
  avatarUser: {
    width: "26px",
    height: "26px",
    borderRadius: "6px",
    background: "rgba(255, 255, 255, 0.08)",
    border: "1px solid var(--glass-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bubble: {
    padding: "10px 14px",
    borderRadius: "12px",
    maxWidth: "calc(100% - 70px)",
    fontSize: "0.86rem",
    lineHeight: "1.45",
    textAlign: "left",
  },
  typingDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "var(--text-secondary)",
    display: "inline-block",
    animation: "pulseGlow 1.2s infinite ease-in-out",
  },
  inputForm: {
    display: "flex",
    gap: "10px",
  },
  input: {
    flexGrow: 1,
    background: "rgba(10, 15, 30, 0.6)",
    fontSize: "0.86rem",
  },
  sendBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    flexShrink: 0,
  },
};
