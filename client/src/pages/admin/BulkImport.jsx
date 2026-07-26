import { useState } from "react";

import AdminLayout from "../../components/admin/AdminLayout";
import { bulkImportQuestions } from "../../services/adminQuestionService";

const SAMPLE = `[
  {
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "Easy",
    "topic": "arrays",
    "companies": ["Amazon", "Google"],
    "sheets": ["Blind 75", "NeetCode 150"],
    "leetcodeNumber": 1,
    "leetcodeUrl": "https://leetcode.com/problems/two-sum/",
    "youtubeUrl": "",
    "articleUrl": "",
    "tags": ["Array", "Hash Map"],
    "estimatedTime": 15,
    "frequency": 5
  }
]`;

function BulkImport() {
  const [jsonText, setJsonText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [parseError, setParseError] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      setJsonText(evt.target.result);
      setParseError("");
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setParseError("");
    setResult(null);

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      setParseError("Invalid JSON: " + err.message);
      return;
    }

    if (!Array.isArray(parsed)) {
      setParseError("JSON must be an array of question objects.");
      return;
    }

    setLoading(true);
    try {
      const res = await bulkImportQuestions(parsed);
      setResult(res.data);
    } catch (err) {
      setParseError(
        err.response?.data?.message ||
          "Import failed. Check server logs."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">
          Bulk Import Questions
        </h1>
        <p className="text-slate-400 mb-6">
          Paste or upload a JSON array of questions. Each item
          needs <code>title</code>, <code>slug</code>,{" "}
          <code>topic</code> (a topic slug), and{" "}
          <code>leetcodeUrl</code>. <code>companies</code> and{" "}
          <code>sheets</code> are arrays of existing names.
          Importing is safe to re-run — questions are matched
          and updated by <code>slug</code>, nothing is
          duplicated.
        </p>

        <div className="mb-4 flex items-center gap-4">
          <label className="cursor-pointer rounded-lg bg-slate-700 px-4 py-2 hover:bg-slate-600">
            Upload JSON file
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => setJsonText(SAMPLE)}
            className="text-sm text-cyan-400 hover:underline"
          >
            Load sample format
          </button>
        </div>

        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value);
            setResult(null);
            setParseError("");
          }}
          placeholder="Paste JSON array of questions here..."
          rows={16}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 p-4 font-mono text-sm"
        />

        {parseError && (
          <div className="mt-3 rounded-lg border border-red-800 bg-red-950 p-3 text-red-300">
            {parseError}
          </div>
        )}

        <button
          type="button"
          onClick={handleImport}
          disabled={loading || !jsonText.trim()}
          className="mt-4 rounded-lg bg-cyan-600 px-6 py-3 font-medium hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Importing..." : "Run Import"}
        </button>

        {result && (
          <div className="mt-6 rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h3 className="mb-3 text-lg font-semibold">
              Import Summary
            </h3>

            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="rounded-lg bg-slate-800 p-3">
                <div className="text-2xl font-bold">
                  {result.total}
                </div>
                <div className="text-xs text-slate-400">
                  Total
                </div>
              </div>

              <div className="rounded-lg bg-green-950 p-3">
                <div className="text-2xl font-bold text-green-400">
                  {result.created}
                </div>
                <div className="text-xs text-slate-400">
                  Created
                </div>
              </div>

              <div className="rounded-lg bg-cyan-950 p-3">
                <div className="text-2xl font-bold text-cyan-400">
                  {result.updated}
                </div>
                <div className="text-xs text-slate-400">
                  Updated
                </div>
              </div>

              <div className="rounded-lg bg-red-950 p-3">
                <div className="text-2xl font-bold text-red-400">
                  {result.skipped}
                </div>
                <div className="text-xs text-slate-400">
                  Skipped
                </div>
              </div>
            </div>

            {result.errors?.length > 0 && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium text-red-400">
                  Issues ({result.errors.length})
                </h4>
                <ul className="max-h-48 overflow-y-auto rounded-lg bg-slate-950 p-3 text-sm text-slate-300 space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default BulkImport;
