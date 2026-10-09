import { useState } from "react";

function TopicForm({
  onClose,
  onSave,
  initialData = null,
}) {
  const [form, setForm] = useState(() => ({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        icon: initialData?.icon || "📚",
      }));



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

    if (name === "name") {
      setForm((prev) => ({
        ...prev,
        name: value,
        slug: generateSlug(value),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.slug) {
      alert("Please fill all required fields.");
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[600px] rounded-xl bg-slate-900 p-8">

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            {initialData
              ? "Edit Topic"
              : "Add Topic"}
          </h2>

          <button
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
              Topic Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              placeholder="Arrays"
            />
          </div>

          <div>
            <label className="mb-2 block">
              Slug
            </label>

            <input
              value={form.slug}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-700 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block">
              Icon
            </label>

            <input
              type="text"
              name="icon"
              value={form.icon}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              placeholder="📚"
            />
          </div>

          <div className="flex justify-end gap-3 pt-5">

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
                ? "Update Topic"
                : "Save Topic"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default TopicForm;