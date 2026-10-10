import QuestionRow from "./QuestionRow";

function QuestionTable({
  questions = [],
  onToggleSolved,
  onToggleBookmark,
  onOpenNotes,
  showNotes = false,
  solvingId,
  bookmarkingId
}) {
  return (
    <div className="question-table overflow-x-auto">
      <table className="min-w-full table-fixed">
        <thead >
          <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <th className="w-12 px-4 py-3 text-left">Status</th>
            <th className="w-12 px-4 py-3 text-center">★</th>
            {showNotes && <th className="w-16 px-4 py-3 text-center">Notes</th>}
            <th className="px-4 py-3 text-left">Question</th>
            <th className="w-32 px-4 py-3 text-left">Difficulty</th>
            <th className="w-48 px-4 py-3 text-center">Companies</th>
          </tr>
        </thead>

        <tbody >
          {questions.length === 0 ? (
            <tr>
              <td
                colSpan={showNotes ? "6" : "5"}
                className="py-14 text-center text-sm text-slate-500"
              >
                No questions found.
              </td>
            </tr>
          ) : (
            questions.map((question) => (
              <QuestionRow
                key={question.entryKey || question._id}
                question={question}
                onToggleSolved={onToggleSolved}
                onToggleBookmark={onToggleBookmark}
                onOpenNotes={onOpenNotes}
                showNotes={showNotes}
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
