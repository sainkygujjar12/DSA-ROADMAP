import { useEffect, useState } from "react";

function SheetForm({
  onClose,
  onSave,
  initialData = null,
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    author: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        slug: initialData.slug || "",
        author: initialData.author || "",
        description:
          initialData.description || "",
        isActive:
          initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const generateSlug = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

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
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name) {
      alert("Sheet name is required");
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

      <div className="w-[700px] rounded-xl bg-slate-900 p-8">

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-3xl font-bold">
            {initialData
              ? "Edit Sheet"
              : "Add Sheet"}
          </h2>

          <button
            onClick={onClose}
            className="text-3xl"
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
              Sheet Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
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
              Author
            </label>

            <input
              name="author"
              value={form.author}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />

          </div>

          <div>

            <label className="mb-2 block">
              Description
            </label>

            <textarea
              rows="4"
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
            />

          </div>

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />

            Active Sheet

          </label>

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
                ? "Update Sheet"
                : "Save Sheet"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default SheetForm;