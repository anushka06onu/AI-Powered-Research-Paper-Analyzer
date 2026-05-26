import React, { useState } from "react";
import {
  FileText,
  Database,
  Cpu,
  Brain,
  AlertTriangle,
  Flame,
  CheckCircle,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import DropZone from "./components/DropZone";
import AnalysisDashboard from "./components/AnalysisDashboard";
import ChatSection from "./components/ChatSection";
import DocumentPreview from "./components/DocumentPreview";
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Retrieve Gemini API Key from environment variables securely
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Client-side PDF text and heading extractor
const extractPdfTitleAndText = async (fileUrl) => {
  try {
    const loadingTask = pdfjsLib.getDocument(fileUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    const textLines = [];
    let currentLine = '';
    let lastY = -1;
    
    for (const item of items) {
      if (!item.str.trim()) continue;
      
      const y = item.transform[5];
      const fontSize = item.transform[0];
      
      if (lastY === -1 || Math.abs(y - lastY) < 5) {
        currentLine += (currentLine ? ' ' : '') + item.str;
      } else {
        if (currentLine.trim()) {
          textLines.push({ text: currentLine.trim(), y: lastY, fontSize });
        }
        currentLine = item.str;
      }
      lastY = y;
    }
    if (currentLine.trim()) {
      textLines.push({ text: currentLine.trim(), y: lastY, fontSize: items[items.length - 1]?.transform[0] || 10 });
    }
    
    textLines.sort((a, b) => b.y - a.y);
    
    let headingTitle = '';
    let authorNames = [];
    
    if (textLines.length > 0) {
      let maxFontSize = 0;
      let titleIndex = 0;
      
      const scanLimit = Math.min(10, textLines.length);
      for (let i = 0; i < scanLimit; i++) {
        if (textLines[i].fontSize > maxFontSize) {
          maxFontSize = textLines[i].fontSize;
          titleIndex = i;
        }
      }
      
      headingTitle = textLines[titleIndex]?.text || '';
      
      if (titleIndex + 1 < textLines.length && Math.abs(textLines[titleIndex].fontSize - textLines[titleIndex + 1].fontSize) < 3) {
        headingTitle += ' ' + textLines[titleIndex + 1].text;
      }
      
      for (let i = titleIndex + 1; i < Math.min(titleIndex + 5, textLines.length); i++) {
        const lineText = textLines[i].text;
        if (
          lineText.toLowerCase().includes("abstract") || 
          lineText.toLowerCase().includes("introduction") ||
          lineText.toLowerCase().includes("email") ||
          lineText.length > 100
        ) {
          break;
        }
        const names = lineText.split(/[,;\t]/).map(n => n.replace(/[*†1-9]/g, "").trim()).filter(n => n.length > 3 && n.length < 30);
        if (names.length > 0) {
          authorNames.push(...names);
        }
      }
    }
    
    return {
      extractedTitle: headingTitle.trim(),
      extractedAuthors: authorNames.slice(0, 3)
    };
  } catch (err) {
    console.error("PDF.js parsing failed:", err);
    return { extractedTitle: "", extractedAuthors: [] };
  }
};

export default function App() {
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);
  const [activeTab, setActiveTab] = useState("analysis");

  // Helper: Generates realistic mock analysis when API key is missing or calls fail
  const generateMockAnalysis = (fileName, base64, extractedTitle, extractedAuthors) => {
    let pdfMeta = { title: "", author: "" };
    
    // Scan PDF binary metadata for real /Title and /Author properties
    if (base64) {
      try {
        const binary = atob(base64.slice(0, 150000)); // scan first 150KB
        
        const titleMatch = binary.match(/\/Title\s*\(([^)]+)\)/);
        if (titleMatch && titleMatch[1]) {
          const rawTitle = titleMatch[1].replace(/\\([()])/g, "$1").trim();
          if (rawTitle && !rawTitle.includes("\u00fe") && !rawTitle.startsWith("\xfe")) {
            pdfMeta.title = rawTitle;
          }
        }
        
        const authorMatch = binary.match(/\/Author\s*\(([^)]+)\)/);
        if (authorMatch && authorMatch[1]) {
          const rawAuthor = authorMatch[1].replace(/\\([()])/g, "$1").trim();
          if (rawAuthor && !rawAuthor.includes("\u00fe") && !rawAuthor.startsWith("\xfe")) {
            pdfMeta.author = rawAuthor;
          }
        }
      } catch (e) {
        console.error("Error extracting local PDF metadata:", e);
      }
    }

    const cleanName = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
    let title = extractedTitle || pdfMeta.title;
    
    if (!title) {
      const lowerFile = fileName.toLowerCase();
      if (lowerFile.includes("attention") || lowerFile.includes("transformer") || lowerFile.includes("network")) {
        title = "Attention Is All You Need: High-Performance Parallel Transformers";
      } else if (lowerFile.includes("covid") || lowerFile.includes("medical") || lowerFile.includes("health")) {
        title = "Epidemiological Dynamics and Multi-Organ Pathology of Viral Pathogens";
      } else if (lowerFile.includes("climate") || lowerFile.includes("carbon") || lowerFile.includes("earth")) {
        title = "Decadal Modeling of Climate Feedback Loops and Carbon Sequestration Systems";
      } else if (lowerFile.includes("quantum") || lowerFile.includes("physics")) {
        title = "Coherent Quantum State Control in Semiconductor Qubit Arrays";
      } else if (lowerFile.includes("economic") || lowerFile.includes("finance") || lowerFile.includes("market")) {
        title = "Macroeconomic Shocks and Liquidity Constraints in Decentralized Asset Markets";
      } else if (lowerFile.includes("database") || lowerFile.includes("sql") || lowerFile.includes("consensus")) {
        title = "Distributed Consensus Protocols for Ultra-Low Latency Transactions";
      } else {
        // Professional scientific fallback
        const formattedName = cleanName
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        title = formattedName.length < 25 
          ? `An In-Depth Investigation into the Properties and Optimization of ${formattedName}`
          : formattedName;
      }
    }

    // Assign realistic authors or mark empty if file looks like a clean document
    let authors = [];
    if (extractedAuthors && extractedAuthors.length > 0) {
      authors = extractedAuthors;
    } else if (pdfMeta.author) {
      authors = [pdfMeta.author];
    } else {
      const lowerFile = fileName.toLowerCase();
      if (lowerFile.includes("report") || lowerFile.includes("resume") || lowerFile.includes("cv") || lowerFile.includes("lecture") || lowerFile.includes("note")) {
        authors = ["Authors Not Identified"];
      } else {
        authors = ["Dr. Evelyn Vance", "Prof. Marcus Thorne", "Sarah Jenkins"];
      }
    }

    return {
      title: title,
      authors: authors,
      abstract_summary: `This paper introduces a state-of-the-art methodology based on "${title}". The research addresses critical latency and bandwidth bottlenecks in current systems by constructing an optimized parallel processing architecture, demonstrating significant empirical gains.`,
      key_contributions: [
        `Design of an adaptive feedback control loop optimized specifically for ${title}`,
        "Observed reduction of computational overhead by 37.4% under high stress tests",
        "Introduction of an open-access evaluation suite for hardware benchmarks",
        "Successful integration testing across heterogeneous cloud infrastructures"
      ],
      methodology: `The research framework employs a three-tier processing model. First, raw streaming telemetry is ingested and filtered. Second, an intelligent scheduling broker distributes parallel loads. Finally, a loss-minimization layer aggregates outputs, stabilizing feedback control loops in real-time.`,
      keywords: [
        cleanName.split(" ")[0] || "Analysis",
        "Parallel Computing",
        "Performance Optimization",
        "Benchmarking",
        "System Architecture"
      ],
      future_work: [
        "Porting the operational compiler to edge IoT sensor platforms",
        "Implementing native support for zero-shot dynamic load resizing",
        "Integrating deep reinforcement learning models for cognitive routing"
      ]
    };
  };

  const handleFileLoaded = async (loadedFile) => {
    setFile(loadedFile);
    // Reset previous states
    setAnalysisResult(null);
    setChatHistory([]);
    setSystemAlert(null);

    // Extract visual heading title and authors from PDF client-side!
    try {
      const { extractedTitle, extractedAuthors } = await extractPdfTitleAndText(loadedFile.url);
      setFile(prev => {
        if (!prev || prev.url !== loadedFile.url) return prev;
        return {
          ...prev,
          extractedTitle: extractedTitle || "",
          extractedAuthors: extractedAuthors || []
        };
      });
    } catch (e) {
      console.error("Local heading parsing failed:", e);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setChatHistory([]);
    setSystemAlert(null);
  };

  const triggerAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setSystemAlert(null);

    // If API Key is missing, trigger simulated mode
    if (!GEMINI_API_KEY) {
      setTimeout(() => {
        const mockData = generateMockAnalysis(file.name, file.base64, file.extractedTitle, file.extractedAuthors);
        setAnalysisResult(mockData);
        setIsAnalyzing(false);
        setSystemAlert({
          type: "simulated",
          message: "No Gemini API Key configured in your .env file. Running in High-Fidelity Simulated Mode."
        });
      }, 2500);
      return;
    }

    // Direct Gemini-2.0-Flash API Call
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: file.base64
                  }
                },
                {
                  text: `You are a professional research paper analyst. Analyze this research paper and extract structural details into the requested JSON schema. You MUST return ONLY valid, raw JSON without backticks, markdown formatting, or conversational text. Use this exact JSON structure:
{
  "title": "Full official paper title",
  "authors": ["Author name 1", "Author name 2"],
  "abstract_summary": "2-3 sentence plain-English summary",
  "key_contributions": ["contribution 1", "contribution 2"],
  "methodology": "Simple explanation of the research process in 3-5 sentences a high school student could understand",
  "keywords": ["keyword1", "keyword2"],
  "future_work": ["suggestion 1", "suggestion 2"]
}`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        let errorMsg = `Status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error && errData.error.message) {
            errorMsg = errData.error.message;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText.trim());
      
      setAnalysisResult(parsed);
      setSystemAlert({
        type: "success",
        message: "Successfully analyzed research paper using Gemini-2.0-Flash."
      });
    } catch (err) {
      console.error("API Call Error, falling back to mock:", err);
      // Fail gracefully: show warning and launch mockup
      const mockData = generateMockAnalysis(file.name, file.base64, file.extractedTitle, file.extractedAuthors);
      setAnalysisResult(mockData);
      setSystemAlert({
        type: "warning",
        message: `Gemini API connection failed (${err.message}). Loaded high-fidelity mock report to preserve workflow.`
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || chatLoading) return;

    const newChatHistory = [...chatHistory, { role: "user", content: text }];
    setChatHistory(newChatHistory);
    setChatLoading(true);

    // If API Key is missing, trigger simulated replies
    if (!GEMINI_API_KEY) {
      setTimeout(() => {
        let reply = "";
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes("limitation") || lowerText.includes("weakness")) {
          reply = `In this research on "${analysisResult?.title || "the uploaded paper"}", key limitations center on:
1. **Sample Generalizability**: Tests were performed on a restricted set of hardware configurations, which may not capture performance scaling issues in production environments.
2. **Computational Footprint**: The high density of operations still demands substantial initial compute resource buffers during startup.
3. **Data Dependency**: The architecture is highly dependent on high-fidelity telemetry feeds; missing or corrupt inputs could degrade aggregation precision.`;
        } else if (lowerText.includes("methodology") || lowerText.includes("how did they")) {
          reply = `The core methodology involves a three-phase scientific workflow:
1. **Telemetry Capture**: Custom hooks ingest raw system indicators with sub-millisecond latency.
2. **Dynamic Scheduling**: An intelligent middleware layer partitions pipeline threads based on actual processor weights.
3. **Aggregating Feedback**: Output datasets are normalized, feeding a convergence loop that mitigates error rates.`;
        } else if (lowerText.includes("application") || lowerText.includes("practical")) {
          reply = `Practical applications of "${analysisResult?.title || "this research"}" include:
- **Cloud Datacenter Management**: Automating node allocations in large-scale server matrices.
- **Embedded Computing**: Reducing CPU overhead in smart industrial IoT gateway systems.
- **Aesthetic UI Architectures**: Constructing highly-responsive, micro-controlled user dashboards.`;
        } else {
          reply = `Regarding your question about "${text}":

Based on the parsed paper metrics for "${analysisResult?.title || "this document"}", the authors emphasize that their design successfully isolates and resolves this specific problem domain. The experimental sections document a 25%+ improvement in performance metrics when running within normal parameter ranges. Future validation steps will expand directly on this aspect.`;
        }

        setChatHistory([...newChatHistory, { role: "assistant", content: reply }]);
        setChatLoading(false);
      }, 1500);
      return;
    }

    // Direct Gemini-2.0-Flash Chat API Call
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: file.base64
                  }
                },
                {
                  text: "Please analyze the attached paper. I will ask you follow-up questions about it."
                }
              ]
            },
            ...newChatHistory.map(msg => ({
              role: msg.role === "user" ? "user" : "model",
              parts: [
                {
                  text: msg.content
                }
              ]
            }))
          ],
          systemInstruction: {
            parts: [
              {
                text: "You are a professional research paper Q&A assistant. Answer user questions directly based on the uploaded research paper. Keep answers structured, technical, and objective."
              }
            ]
          }
        })
      });

      if (!response.ok) {
        let errorMsg = `Status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData.error && errData.error.message) {
            errorMsg = errData.error.message;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;

      setChatHistory([...newChatHistory, { role: "assistant", content: rawText }]);
    } catch (err) {
      console.error("Chat API error, falling back to mock reply:", err);
      setChatHistory([
        ...newChatHistory,
        {
          role: "assistant",
          content: `[Network Fallback] I received your question: "${text}". Unfortunately, the Gemini API channel is experiencing blockages (${err.message}). Under standard operations, this question triggers a full textual lookup on the attached PDF base64 payload to fetch context-specific proofs.`
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Glowing background particles */}
      <div className="glow-spot glow-purple" />
      <div className="glow-spot glow-indigo" />

      {/* Header bar */}
      <header className="glass-card" style={styles.header}>
        <div style={styles.logoWrapper}>
          <div style={styles.logoIcon}>
            <Brain size={24} style={{ color: "var(--accent-primary)" }} />
          </div>
          <div>
            <h1 style={styles.logoText}>
              AURA <span style={styles.subLogoText}>Research Workspace</span>
            </h1>
            <p style={styles.logoSub}>AI-Powered Academic Intelligence & Q&A Workspace</p>
          </div>
        </div>

      </header>

      {/* Main Workspace Body */}
      <main className="main-grid">
        
        {/* Upload Zone & PDF View Column */}
        <section style={styles.workspaceColumn}>
          <DropZone onFileLoaded={handleFileLoaded} file={file} onReset={handleReset} />
          
          {file && !analysisResult && !isAnalyzing && (
            <div className="glass-card animate-fade-in" style={styles.startAnalysisCard}>
              <Cpu size={24} style={{ color: "var(--accent-primary)", marginBottom: "8px" }} />
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", marginBottom: "4px" }}>
                Ready for Deep Extraction
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: "1.4" }}>
                AURA will convert the document to deep text representation and extract structured components.
              </p>
              <button onClick={triggerAnalysis} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Analyze Research Paper
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-card" style={styles.analyzingCard}>
              <div className="scanner-overlay" />
              <div className="scanner-line" />
              <RefreshCw className="spinner" size={32} style={{ color: "var(--accent-primary)", marginBottom: "16px" }} />
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.15rem", marginBottom: "4px" }}>
                Analyzing Academic Blueprint...
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Parsing PDF structures, mapping equations, and synthesizing plain-English cards.
              </p>
            </div>
          )}

          {file && <DocumentPreview file={file} />}
        </section>

        {/* AI Analysis Output & Chat Column */}
        <section style={{ ...styles.workspaceColumn, overflowY: "auto", paddingRight: "6px" }}>
          {systemAlert && (
            <div
              className="animate-fade-in"
              style={{
                ...styles.alertBanner,
                background:
                  systemAlert.type === "simulated"
                    ? "rgba(168, 85, 247, 0.08)"
                    : systemAlert.type === "warning"
                    ? "rgba(234, 179, 8, 0.08)"
                    : "rgba(20, 184, 166, 0.08)",
                borderColor:
                  systemAlert.type === "simulated"
                    ? "rgba(168, 85, 247, 0.25)"
                    : systemAlert.type === "warning"
                    ? "rgba(234, 179, 8, 0.25)"
                    : "rgba(20, 184, 166, 0.25)"
              }}
            >
              {systemAlert.type === "warning" ? (
                <AlertTriangle size={16} style={{ color: "#eab308", flexShrink: 0 }} />
              ) : (
                <CheckCircle size={16} style={{ color: "var(--accent-teal)", flexShrink: 0 }} />
              )}
              <span style={{ fontSize: "0.82rem", color: "var(--text-primary)" }}>
                {systemAlert.message}
              </span>
            </div>
          )}

          {analysisResult ? (
            <div style={styles.workspaceTabsContainer}>
              {/* Tab Headers */}
              <div style={styles.tabHeaders}>
                <button
                  onClick={() => setActiveTab("analysis")}
                  style={{
                    ...styles.tabBtn,
                    borderBottomColor: activeTab === "analysis" ? "var(--accent-primary)" : "transparent",
                    color: activeTab === "analysis" ? "#fff" : "var(--text-secondary)",
                    background: activeTab === "analysis" ? "rgba(99, 102, 241, 0.08)" : "transparent",
                  }}
                >
                  <Database size={16} />
                  <span>AI Summary Cards</span>
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  style={{
                    ...styles.tabBtn,
                    borderBottomColor: activeTab === "chat" ? "var(--accent-secondary)" : "transparent",
                    color: activeTab === "chat" ? "#fff" : "var(--text-secondary)",
                    background: activeTab === "chat" ? "rgba(168, 85, 247, 0.08)" : "transparent",
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Interactive Chat Q&A</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div style={styles.tabContentWrapper}>
                {activeTab === "analysis" ? (
                  <AnalysisDashboard data={analysisResult} />
                ) : (
                  <ChatSection
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                    isLoading={chatLoading}
                    onClearHistory={() => setChatHistory([])}
                  />
                )}
              </div>
            </div>
          ) : (
            !isAnalyzing && (
              <div className="glass-card" style={styles.emptyOutputCard}>
                <Database size={44} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#fff", marginBottom: "8px" }}>
                  Awaiting PDF Upload
                </h3>
                <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", maxWidth: "300px", lineHeight: "1.5" }}>
                  Upload a research paper in the left pane to unlock full card visualization and interactive chat Q&A.
                </p>
              </div>
            )
          )}
        </section>

      </main>
    </div>
  );
}

// Inline custom spins for React
const RefreshCw = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
    border: "1px solid var(--glass-border)",
    background: "rgba(10, 15, 30, 0.55)",
    boxShadow: "0 8px 32px 0 rgba(0,0,0,0.2)",
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    textAlign: "left",
  },
  logoIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "rgba(99, 102, 241, 0.1)",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 15px rgba(99, 102, 241, 0.15)",
  },
  logoText: {
    fontFamily: "var(--font-heading)",
    fontSize: "1.45rem",
    fontWeight: "800",
    color: "#fff",
    lineHeight: "1.15",
    letterSpacing: "0.05em",
  },
  subLogoText: {
    color: "var(--accent-primary)",
    fontWeight: "400",
  },
  logoSub: {
    fontSize: "0.78rem",
    color: "var(--text-secondary)",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
  },
  apiBtn: {
    padding: "10px 18px",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  workspaceColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
    height: "100%",
  },
  workspaceTabsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    height: "100%",
  },
  tabHeaders: {
    display: "flex",
    borderBottom: "1px solid var(--glass-border)",
    background: "rgba(10, 15, 30, 0.4)",
    borderRadius: "12px 12px 0 0",
    padding: "4px 8px 0 8px",
    gap: "8px",
  },
  tabBtn: {
    padding: "12px 20px",
    fontSize: "0.88rem",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "2px solid transparent",
    borderRadius: "8px 8px 0 0",
    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
    cursor: "pointer",
  },
  tabContentWrapper: {
    flexGrow: 1,
    height: "calc(100% - 60px)",
    overflowY: "auto",
    paddingRight: "4px",
  },
  startAnalysisCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    border: "1px solid var(--glass-border)",
    background: "rgba(15, 23, 42, 0.4)",
  },
  analyzingCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "48px 24px",
    border: "1px solid rgba(99, 102, 241, 0.25)",
    background: "rgba(10, 12, 30, 0.6)",
  },
  emptyOutputCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "120px 40px",
    border: "1px dashed var(--glass-border)",
    background: "rgba(15, 23, 42, 0.2)",
    height: "100%",
    minHeight: "450px",
  },
  alertBanner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "1px solid",
    textAlign: "left",
  },
};
