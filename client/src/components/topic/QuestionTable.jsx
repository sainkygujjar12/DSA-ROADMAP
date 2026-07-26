import QuestionRow from "./QuestionRow";

function QuestionTable({ questions = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-slate-800">
      <table className="min-w-full">

        <thead className="bg-slate-900/80">
          <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">

            <th className="px-4 py-3.5 text-left">
              Status
            </th>

            <th className="px-4 py-3.5 text-left">
              Bookmark
            </th>

            <th className="px-4 py-3.5 text-left">
              Question
            </th>

            <th className="px-4 py-3.5 text-left">
              Difficulty
            </th>

            <th className="px-4 py-3.5 text-left">
              Companies
            </th>

            <th className="px-4 py-3.5 text-left">
              Action
            </th>

          </tr>
        </thead>

        <tbody className="bg-slate-950/40">
          {questions.length === 0 ? (
            <tr>
              <td
                colSpan="6"
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
              />
            ))
          )}
        </tbody>

      </table>
    </div>
  );
}

export default QuestionTable;
