function ConfirmDelete({
  title,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-xl p-8 w-[420px]">
        <h2 className="text-2xl font-bold">
          Delete {title}?
        </h2>

        <p className="mt-4 text-slate-400">
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onCancel}
            className="rounded bg-slate-700 px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded bg-red-600 px-5 py-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDelete;