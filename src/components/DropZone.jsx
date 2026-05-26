import React, { useState, useRef } from "react";
import { FileUp, FileText, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function DropZone({ onFileLoaded, file, onReset }) {
  const [dragActive, setDragActive] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Invalid file type. Please upload a research paper in PDF format.");
      return;
    }

    setError(null);
    setIsReading(true);

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result;
        // strip prefix: "data:application/pdf;base64,"
        const base64 = result.split(",")[1];
        
        // Generate a local object URL for previewing
        const fileUrl = URL.createObjectURL(selectedFile);
        
        onFileLoaded({
          name: selectedFile.name,
          size: selectedFile.size,
          base64: base64,
          url: fileUrl
        });
      } catch (err) {
        setError("Error processing PDF file. Please try again.");
        console.error("FileReader Error:", err);
      } finally {
        setIsReading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read the file.");
      setIsReading(false);
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current.click();
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="animate-fade-in" style={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInputClick}
          className="glass-card"
          style={{
            ...styles.dropBox,
            borderColor: dragActive ? "var(--accent-primary)" : "var(--glass-border)",
            backgroundColor: dragActive ? "rgba(99, 102, 241, 0.05)" : "var(--glass-bg)",
            boxShadow: dragActive ? "var(--glow-shadow)" : "var(--card-shadow)",
          }}
        >
          <div style={styles.content}>
            <div
              style={{
                ...styles.iconWrapper,
                background: dragActive ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.03)",
                transform: dragActive ? "scale(1.1) rotate(5deg)" : "scale(1)",
              }}
            >
              {isReading ? (
                <RefreshCw className="spinner" size={28} style={{ color: "var(--accent-primary)" }} />
              ) : (
                <FileUp size={28} style={{ color: dragActive ? "var(--accent-primary)" : "var(--text-secondary)" }} />
              )}
            </div>

            <div style={styles.textContainer}>
              <h3 style={styles.title}>
                {isReading ? "Reading Research Paper..." : "Upload Your Research Paper"}
              </h3>
              <p style={styles.subtitle}>
                {isReading
                  ? "Extracting PDF contents for analysis..."
                  : "Drag and drop your PDF here, or click to browse local files"}
              </p>
            </div>

            <span style={styles.limits}>Supports PDF files up to 10MB</span>
          </div>

          {error && (
            <div style={styles.errorBanner} className="animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />
              <span style={styles.errorText}>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-card" style={styles.uploadedBox}>
          <div style={styles.uploadedHeader}>
            <div style={styles.pdfIconWrapper}>
              <FileText size={24} style={{ color: "var(--accent-primary)" }} />
            </div>
            <div style={{ flexGrow: 1, textAlign: "left" }}>
              <h4 className="uploaded-file-name">{file.name}</h4>
              <p style={styles.fileSize}>{formatBytes(file.size)}</p>
            </div>
            <div style={styles.statusBadge}>
              <CheckCircle2 size={16} style={{ color: "var(--accent-teal)" }} />
              <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: "600" }}>Loaded</span>
            </div>
          </div>

          <div style={styles.uploadedActions}>
            <button onClick={onReset} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
              Upload Different Paper
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    position: "relative",
    zIndex: 10,
  },
  dropBox: {
    border: "2px dashed var(--glass-border)",
    borderRadius: "18px",
    padding: "36px 24px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "center",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
  },
  iconWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "16px",
    border: "1px solid var(--glass-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  title: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "0.88rem",
    color: "var(--text-secondary)",
    maxWidth: "320px",
    lineHeight: "1.4",
  },
  limits: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  errorBanner: {
    marginTop: "20px",
    padding: "10px 14px",
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    maxWidth: "90%",
  },
  errorText: {
    fontSize: "0.8rem",
    color: "#fca5a5",
    fontWeight: "500",
  },
  uploadedBox: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 15px rgba(99, 102, 241, 0.05)",
  },
  uploadedHeader: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  pdfIconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "rgba(99, 102, 241, 0.1)",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  fileSize: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(20, 184, 166, 0.08)",
    border: "1px solid rgba(20, 184, 166, 0.2)",
    padding: "6px 12px",
    borderRadius: "50px",
    flexShrink: 0,
  },
  uploadedActions: {
    display: "flex",
    justifyContent: "flex-start",
    borderTop: "1px solid var(--glass-border)",
    paddingTop: "12px",
  },
};
