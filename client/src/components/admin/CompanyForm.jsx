import { useEffect, useState } from "react";

function CompanyForm({
  onClose,
  onSave,
  initialData = null,
}) {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    logo: "",
    color: "#2563EB",
    website: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        slug: initialData.slug || "",
        logo: initialData.logo || "",
        color: initialData.color || "#2563EB",
        website: initialData.website || "",
        description: initialData.description || "",
        isActive: initialData.isActive ?? true,
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

  const generateLogo = (website) => {
    try {
      const url = new URL(website);

      return `https://logo.clearbit.com/${url.hostname.replace(
        "www.",
        ""
      )}`;
    } catch {
      return "";
    }
  };

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

    if (name === "website") {
      setForm((prev) => ({
        ...prev,
        website: value,
        logo: generateLogo(value),
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

    if (!form.name || !form.slug) {
      alert("Company name is required.");
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[750px] rounded-xl bg-slate-900 p-8 max-h-[90vh] overflow-y-auto">

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            {initialData
              ? "Edit Company"
              : "Add Company"}
          </h2>

          <button
            type="button"
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
              Company Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Google"
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

          <div className="grid grid-cols-2 gap-5">

            <div>
              <label className="mb-2 block">
                Website
              </label>

              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://google.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3"
              />
            </div>

            <div className="flex items-center justify-center">

              {form.logo ? (
                <img
                  src={form.logo}
                  alt="Company Logo"
                  className="h-20 w-20 rounded-full border border-slate-700 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/80x80?text=Logo";
                  }}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700 text-3xl">
                  🏢
                </div>
              )}

            </div>

          </div>

          <div>
            <label className="mb-2 block">
              Logo URL
            </label>

            <input
              value={form.logo}
              readOnly
              className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-700 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block">
              Brand Color
            </label>

            <input
              type="color"
              name="color"
              value={form.color}
              onChange={handleChange}
              className="h-12 w-full rounded-lg"
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

            Active Company

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
                ? "Update Company"
                : "Save Company"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default CompanyForm;