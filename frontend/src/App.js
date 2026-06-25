import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [analysis, setAnalysis] = useState({
    score: null,
    strengths: [],
    weaknesses: [],
    improvedCV: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    setShowHeader(true);
  }, []);

  const analyzeResume = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "https://smart-cv-production-bba5.up.railway.app/analyze",
        {
          resume,
        }
      );

      setAnalysis(response.data);
      setShowModal(false);
    } catch (err) {
      alert("Error analyzing resume");
      console.log(err);
    }

    setLoading(false);
  };

  const clearAll = () => {
    setResume("");
    setAnalysis({
      score: null,
      strengths: [],
      weaknesses: [],
      improvedCV: "",
    });
    setShowModal(false);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return "#22c55e";
    if (score >= 50) return "#facc15";
    return "#ef4444";
  };

  const copyToClipboard = () => {
    const text = `
SMARTCV AI REPORT

SCORE: ${analysis.score}

STRENGTHS:
${analysis.strengths.join("\n")}

WEAKNESSES:
${analysis.weaknesses.join("\n")}

IMPROVED CV:
${analysis.improvedCV}
    `;

    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const exportAsFile = () => {
    const content = `
SMARTCV AI REPORT

SCORE: ${analysis.score}

STRENGTHS:
${analysis.strengths.join("\n")}

WEAKNESSES:
${analysis.weaknesses.join("\n")}

IMPROVED CV:
${analysis.improvedCV}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "smartcv-report.txt";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="brand">🧠 SmartCV</div>

        <div className="sidebar-spacer" />

        <button
          className="dark-toggle"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* MAIN */}
      <div className="main">

        {/* HEADER */}
        <div className={`topbar ${showHeader ? "fade-in" : ""}`}>
          <p className="subtitle">
            Analyze. Improve. Get Hired.<br />
            AI-powered CV feedback in seconds
          </p>

          <div className="stats">
            <span>⚡ Fast</span>
            <span>🎯 Accurate</span>
            <span>📄 ATS-ready</span>
          </div>
        </div>

        {/* INPUT */}
        <div className="panel">
          <textarea
            placeholder="Paste your CV here..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
          />

          <div className="btn-row">
            <button onClick={analyzeResume} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

            {analysis.score !== null && (
              <>
                <button
                  className="secondary-btn"
                  onClick={() => setShowModal(true)}
                >
                  View Details
                </button>

                <button className="clear-btn" onClick={clearAll}>
                  Clear
                </button>
              </>
            )}
          </div>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p>AI is analyzing your CV...</p>
            </div>
          )}
        </div>

        {/* SCORE */}
        {analysis.score !== null && (
          <div className="score-preview">
            <div
              className="circle"
              style={{
                background: `conic-gradient(
                  ${getScoreColor(analysis.score)} ${analysis.score * 3.6}deg,
                  #e5e7eb 0deg
                )`,
              }}
            >
              <div className="inner-circle">
                <div className="score-number">{analysis.score}</div>
                <div className="score-text">Score</div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>

              <h2>AI Resume Report</h2>

              <div className="section">
                <h3>Strengths</h3>
                <ul>
                  {analysis.strengths.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="section">
                <h3>Weaknesses</h3>
                <ul>
                  {analysis.weaknesses.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="section">
                <h3>Improved CV</h3>
                <p className="cv-text">{analysis.improvedCV}</p>
              </div>

              <div className="modal-footer">
                <button className="action-btn" onClick={copyToClipboard}>
                  📋 Copy
                </button>

                <button className="action-btn" onClick={exportAsFile}>
                  ⬇ Export
                </button>

                <button
                  className="action-btn close"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;