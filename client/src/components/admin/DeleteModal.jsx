function DeleteModal({
  title,
  onCancel,
  onDelete,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[420px] rounded-xl bg-slate-900 p-8">
        <h2 className="text-2xl font-bold">
          Delete Question
        </h2>

        <p className="mt-4 text-slate-400">
          Are you sure you want to delete{" "}
          <span className="font-bold text-white">
            {title}
          </span>
          ?
        </p>

        <div className="mt-8 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg bg-slate-700 px-5 py-2"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg bg-red-600 px-5 py-2 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;