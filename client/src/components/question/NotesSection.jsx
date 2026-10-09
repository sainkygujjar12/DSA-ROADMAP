import { useState } from "react";

import Button from "../ui/Button";
import { saveNotes } from "../../services/progressService";

function NotesSection({
  questionId,
  initialNote = "",
}) {
  const [content, setContent] = useState(initialNote || "");
  const [saving, setSaving] = useState(false);


  const handleSave = async () => {
    try {
      setSaving(true);

      await saveNotes(questionId, content);

      alert("Notes saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save notes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-12 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-2xl font-bold">
        📝 Personal Notes
      </h2>

      <textarea
        rows={10}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your approach, edge cases, mistakes..."
        className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 outline-none focus:border-cyan-500"
      />

      <div className="mt-5">
        <Button onClick={handleSave}>
          {saving ? "Saving..." : "💾 Save Notes"}
        </Button>
      </div>
    </div>
  );
}

export default NotesSection;