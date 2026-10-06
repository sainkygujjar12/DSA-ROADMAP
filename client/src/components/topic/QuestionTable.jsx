import QuestionRow from "./QuestionRow";

function QuestionTable({
  questions = [],
  onToggleSolved,
  onToggleBookmark,
  solvingId,
  bookmarkingId
}) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-slate-800">
      <table className="min-w-full table-fixed">
        <thead className="bg-slate-900/80">
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="w-12 px-4 py-3 text-left">Status</th>
            <th className="w-12 px-4 py-3 text-center">★</th>
            <th className="px-4 py-3 text-left">Question</th>
            <th className="w-32 px-4 py-3 text-left">Difficulty</th>
            <th className="w-24 px-4 py-3 text-center">Companies</th>
          </tr>
        </thead>

        <tbody className="bg-slate-950/40">
          {questions.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                className="py-14 text-center text-sm text-slate-500"
              >
                No questions found.
              </td>
            </tr>
          ) : (
            questions.map((question) => (
              <QuestionRow
                key={question._id}
                question={question}
                onToggleSolved={onToggleSolved}
                onToggleBookmark={onToggleBookmark}
                isSolving={solvingId === question._id}
                isBookmarking={bookmarkingId === question._id}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default QuestionTable;
