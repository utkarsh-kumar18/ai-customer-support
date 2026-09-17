"use client";

import { useState } from "react";

const exampleQuestions = [
  "How can I track my order?",
  "What is the return period?",
  "Can I cancel my order?",
  "What should I do if my product is damaged?",
];

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [ticketStatus, setTicketStatus] = useState(null);

  const askAI = async () => {
    if (!question.trim()) {
      setAnswer("Please enter a question.");
      setSource("");
      return;
    }

    setLoading(true);
    setAnswer("");
    setSource("");
    setTicketId(null);
    setTicketStatus(null);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setAnswer(data.answer);
      setTicketId(data.ticketId || null);
      setTicketStatus(data.status || null);
      setSource(data.source || "");
    } catch (error) {
      setAnswer(error.message || "Unable to generate a response.");
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuestion(example);
    setAnswer("");
    setSource("");
    setTicketId(null);
    setTicketStatus(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            AI-Powered Support
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Customer Support Assistant
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Ask questions about orders, returns, cancellations and support
            policies.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <label className="mb-2 block text-sm font-semibold text-slate-800">
            Your Question
          </label>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Example: How can I track my order?"
            rows={5}
            className="w-full resize-none rounded-xl border border-slate-300 p-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            onClick={askAI}
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating Answer..." : "Ask AI"}
          </button>

          {/* Example Questions */}
          <div className="mt-5">
            <p className="mb-2 text-sm font-medium text-slate-600">
              Try an example:
            </p>

            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((example) => (
                <button
                  key={example}
                  onClick={() => handleExampleClick(example)}
                  className="rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
            <p className="font-medium text-slate-700">
              Analyzing your question...
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Retrieving relevant support information.
            </p>
          </div>
        )}

        {/* Answer */}
        {!loading && answer && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                AI Response
              </h2>

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                AI Generated
              </span>
            </div>

            <p className="whitespace-pre-wrap leading-7 text-slate-700">
              {answer}
            </p>

            {/* Support Ticket */}
            {ticketId && (
              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="font-semibold text-blue-900">
                  Support Ticket Created
                </p>

                <p className="mt-2 text-blue-800">
                  Ticket ID: <strong>{ticketId}</strong>
                </p>

                <p className="text-blue-800">
                  Status: <strong>{ticketStatus}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500">
          AI Customer Support Assistant • Built as an AI + Full-Stack project
        </p>
      </div>
    </main>
  );
}