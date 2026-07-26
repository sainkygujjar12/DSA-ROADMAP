import { useEffect, useState } from "react";
import {
  getTopics,
  getCompanies,
  getSheets,
} from "../../services/adminQuestionService";

function QuestionForm({
  onClose,
  onSave,
  initialData = null,
}) {
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [sheets, setSheets] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    difficulty: "Easy",
    topic: "",
    companies: [],
    sheets: [],
    leetcodeUrl: "",
    gfgUrl: "",
    youtubeUrl: "",
    articleUrl: "",
  });

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        slug: initialData.slug || "",
        difficulty: initialData.difficulty || "Easy",
        topic:
          initialData.topic?._id ||
          initialData.topic ||
          "",
        companies: (initialData.companies || []).map(
          (c) => c._id || c
        ),
        sheets: (initialData.sheets || []).map(
          (s) => s._id || s
        ),
        leetcodeUrl: initialData.leetcodeUrl || "",
        gfgUrl: initialData.gfgUrl || "",
        youtubeUrl: initialData.youtubeUrl || "",
        articleUrl: initialData.articleUrl || "",
      });
    } else {
      setForm({
        title: "",
        slug: "",
        difficulty: "Easy",
        topic: "",
        companies: [],
        sheets: [],
        leetcodeUrl: "",
        gfgUrl: "",
        youtubeUrl: "",
        articleUrl: "",
      });
    }
  }, [initialData]);

  const loadOptions = async () => {
    try {
      const [topicsRes, companiesRes, sheetsRes] =
        await Promise.all([
          getTopics(),
          getCompanies(),
          getSheets(),
        ]);

      setTopics(topicsRes.data);
      setCompanies(companiesRes.data);
      setSheets(sheetsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================
  // Auto Slug Generator
  // ==========================

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setForm((prev) => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================
  // Multi-select toggles (sheets / companies)
  // ==========================

  const toggleSheet = (sheetId) => {
    setForm((prev) => {
      const isSelected = prev.sheets.includes(sheetId);

      return {
        ...prev,
        sheets: isSelected
          ? prev.sheets.filter((id) => id !== sheetId)
          : [...prev.sheets, sheetId],
      };
    });
  };

  const toggleCompany = (companyId) => {
    setForm((prev) => {
      const isSelected = prev.companies.includes(companyId);

      return {
        ...prev,
        companies: isSelected
          ? prev.companies.filter((id) => id !== companyId)
          : [...prev.companies, companyId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !form.title ||
      !form.slug ||
      !form.topic ||
      (!form.leetcodeUrl && !form.gfgUrl)
    ) {
      alert(
        "Please fill all required fields (and at least one of LeetCode/GFG URL)."
      );
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-[700px] overflow-y-auto rounded-xl bg-slate-900 p-8">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            {initialData
              ? "Edit Question"
              : "Add Question"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>
            <label className="mb-2 block">
              Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Two Sum"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block">
              Slug
            </label>

            <input
              type="text"
              value={form.slug}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-700 p-3 text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-2 block">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block">
                Topic
              </label>

              <select
                name="topic"
                value={form.topic}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              >
                <option value="">
                  Select Topic
                </option>

                {topics.map((topic) => (
                  <option
                    key={topic._id}
                    value={topic._id}
                  >
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div>
            <label className="mb-2 block">
              LeetCode URL
            </label>

            <input
              type="url"
              name="leetcodeUrl"
              value={form.leetcodeUrl}
              onChange={handleChange}
              placeholder="https://leetcode.com/problems/two-sum/"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block">
              GeeksforGeeks URL (use this if there's no
              LeetCode equivalent)
            </label>

            <input
              type="url"
              name="gfgUrl"
              value={form.gfgUrl}
              onChange={handleChange}
              placeholder="https://www.geeksforgeeks.org/problems/..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-2 block">
                YouTube URL (optional)
              </label>

              <input
                type="url"
                name="youtubeUrl"
                value={form.youtubeUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block">
                Article URL (optional)
              </label>

              <input
                type="url"
                name="articleUrl"
                value={form.articleUrl}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
            </div>

          </div>

          {/* ============================== */}
          {/* Sheets Multi-Select */}
          {/* ============================== */}

          <div>
            <label className="mb-2 block">
              Sheets
            </label>

            {sheets.length === 0 ? (
              <p className="text-sm text-slate-500">
                No sheets created yet. Create one from the
                Sheets page first.
              </p>
            ) : (
              <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 p-3">
                {sheets.map((sheet) => (
                  <label
                    key={sheet._id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.sheets.includes(
                        sheet._id
                      )}
                      onChange={() =>
                        toggleSheet(sheet._id)
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">
                      {sheet.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ============================== */}
          {/* Companies Multi-Select */}
          {/* ============================== */}

          <div>
            <label className="mb-2 block">
              Companies
            </label>

            {companies.length === 0 ? (
              <p className="text-sm text-slate-500">
                No companies created yet. Create one from the
                Companies page first.
              </p>
            ) : (
              <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 p-3">
                {companies.map((company) => (
                  <label
                    key={company._id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={form.companies.includes(
                        company._id
                      )}
                      onChange={() =>
                        toggleCompany(company._id)
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm">
                      {company.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-700 px-5 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-cyan-600 px-5 py-2 hover:bg-cyan-700"
            >
              {initialData
                ? "Update Question"
                : "Save Question"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default QuestionForm;
