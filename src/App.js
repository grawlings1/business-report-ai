// Extended version with animations, chart container, progress bar, help modal, theme toggle, and enhanced layout
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("data");
  const [darkMode, setDarkMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadTime, setUploadTime] = useState(null);
  const [charCount, setCharCount] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (summary) setCharCount(summary.length);
  }, [summary]);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 300);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const uploadFile = async () => {
    if (!file) return alert("Please select a CSV file first.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError(null);
      const start = Date.now();
      const res = await axios.post("https://business-report-ai-1.onrender.com/upload", formData);
      const end = Date.now();
      setUploadTime(((end - start) / 1000).toFixed(2));
      setData(res.data.data);
      setSummary(res.data.summary);
    } catch (err) {
      console.error("❌ Upload error:", err);
      setError("Upload failed. Please make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const copyToClipboard = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const downloadCSV = () => {
    if (!data) return;
    const csv = [Object.keys(data[0]).join(","), ...data.map(row => Object.values(row).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "business_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTable = () => {
    if (!data || data.length === 0) return null;
    const headers = Object.keys(data[0]);
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-2 whitespace-nowrap text-gray-600">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={`${darkMode ? 'bg-gradient-to-br from-slate-900 via-gray-800 to-black text-white' : 'bg-gradient-to-br from-sky-100 via-white to-sky-200 text-gray-900'} min-h-screen py-10 px-4 font-sans transition-colors`}>
      <div className="max-w-6xl mx-auto mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-2">📘 About This Project</h2>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          This Business Report Generator allows users to upload CSV files containing business metrics such as revenue, expenses, and profit. It then parses and displays the data in a clean table, and uses AI to generate a smart natural-language summary of key insights.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Built with React, Tailwind CSS, Node.js, and Hugging Face AI, this project provides data-driven insights powered by large language models.
        </p>
      </div>

      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 space-y-10 transition-colors animate-fadeIn">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 animate-pulse">📊 Business Report Generator</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Upload your CSV business data and generate AI-powered insights.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md text-sm"
            >
              {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
            >
              ❓ Help
            </button>
          </div>
        </header>

        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg w-11/12 md:w-1/2 relative">
              <h2 className="text-xl font-bold mb-2">How to Use</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Click "Upload CSV" to upload your business report.</li>
                <li>Switch between data and summary views using the tabs.</li>
                <li>Use the copy and download buttons as needed.</li>
              </ul>
              <button
                onClick={() => setShowHelp(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 dark:text-gray-200"
              >
                ✖
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full md:w-auto text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
          />
          <button
            onClick={uploadFile}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-full transition-all shadow-md disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Uploading...
              </span>
            ) : (
              "Upload CSV"
            )}
          </button>
          <button
            onClick={downloadCSV}
            className="text-sm px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            ⬇️ Download CSV
          </button>
        </div>

        {loading && (
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {renderTable()}

        {summary && (
          <div className="mt-8 p-4 border rounded-md bg-blue-50 dark:bg-gray-700">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">AI-Generated Summary</h3>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{summary}</p>
            <div className="mt-2 flex gap-3">
              <button onClick={copyToClipboard} className="text-xs text-blue-600 hover:underline">
                {copied ? "Copied!" : "📋 Copy"}
              </button>
            </div>
          </div>
        )}

        <footer className="text-center text-sm text-gray-500 dark:text-gray-400 mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          &copy; {new Date().getFullYear()} Business Report Generator &mdash; Built with ❤️ by Gabriel Rawlings
        </footer>
      </div>
    </div>
  );
}

export default App;