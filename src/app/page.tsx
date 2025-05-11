"use client";
import React, { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [pages, setPages] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPages([]);
      setSummary("");
      setAnswer("");
      setQuestion("");
    }
  };

  const handleSummarize = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("http://192.168.18.14:5000/summarize", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setSummary(data.summary);
    setDocumentText(data.document_text);
    setAnswer("");
  };

  const handleAsk = async () => {
    const formData = new FormData();
    formData.append("document_text", documentText);
    formData.append("question", question);
    const res = await fetch("http://192.168.18.14:5000/ask", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setAnswer(data.answer);
  };

  const handleViewPages = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://192.168.18.14:5000/pages", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch PDF pages");
      }

      const data = await res.json();
      setPages(data.pages);
    } catch (error) {
      console.error("Error viewing pages:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        PDF Summarizer & Q&A
      </h1>
      <div className="mb-6">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <button
        onClick={handleSummarize}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
        disabled={!file}
      >
        Summarize PDF
      </button>
      <button
        onClick={handleViewPages}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed mb-6"
        disabled={!file}
      >
        View PDF Pages
      </button>

      {pages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">PDF Preview:</h2>
          <div className="grid gap-4">
            {pages.map((src, index) => (
              <img key={index} src={src} alt={`Page ${index + 1}`} className="rounded shadow" />
            ))}
          </div>
        </div>
      )}

      {summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Summary:</h2>
          <p className="bg-gray-100 p-4 rounded-lg text-gray-700">{summary}</p>
        </div>
      )}

      {summary && (
        <div>
          <input
            type="text"
            placeholder="Ask a question about the document"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            onClick={handleAsk}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!question}
          >
            Ask
          </button>
          {answer && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Answer:</h2>
              <p className="bg-gray-100 p-4 rounded-lg text-black">{answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
