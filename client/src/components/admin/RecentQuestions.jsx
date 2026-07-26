function RecentQuestions({ questions }) {
  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 p-6">

      <h2 className="text-2xl font-bold mb-5">
        Recent Questions
      </h2>

      <div className="space-y-3">

        {questions?.map((question) => (
          <div
            key={question._id}
            className="flex justify-between border-b border-slate-800 pb-3"
          >
            <span>{question.title}</span>

            <span className="text-slate-400">
              {question.difficulty}
            </span>
          </div>
        ))}

      </div>

    </div>
  );
}

export default RecentQuestions;