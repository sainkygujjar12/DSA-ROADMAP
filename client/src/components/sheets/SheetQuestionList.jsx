import { Fragment } from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiCheck, FiEdit3, FiExternalLink, FiLoader } from "react-icons/fi";
import DifficultyText from "../ui/DifficultyText";

export default function SheetQuestionList({ questions, onToggleSolved, onToggleBookmark, onOpenNotes, solvingId, bookmarkingId }) {
  if (!questions.length) return <div className="sheet-list-empty">No matching questions. Try another section or search.</div>;
  return <div className="sheet-question-list">
    {questions.map((question, index) => <Fragment key={question.entryKey || question._id}>
      {question.section && question.section !== questions[index - 1]?.section && <h2 className="sheet-section-heading">{question.section}</h2>}
      <article className={`sheet-question-row ${question.solved ? "is-solved" : ""}`}>
        <button className="sheet-solve-control" type="button" aria-pressed={!!question.solved} aria-label={`${question.solved ? 'Mark as unsolved' : 'Mark as solved'}: ${question.title}`} disabled={solvingId === question._id} onClick={() => onToggleSolved(question._id)}>
          {solvingId === question._id ? <FiLoader className="animate-spin" /> : question.solved ? <FiCheck /> : <span>{question.sourceOrder || index + 1}</span>}
        </button>
        <div className="sheet-question-copy"><Link to={`/questions/${question.slug}`}>{question.title}</Link><div><DifficultyText difficulty={question.difficulty} />{question.kind === 'concept' && <span>Concept</span>}</div></div>
        <div className="sheet-question-actions">
          {/^https?:\/\//.test(question.resourceUrl || question.leetcodeUrl || question.gfgUrl || '') && <a href={question.resourceUrl || question.leetcodeUrl || question.gfgUrl} target="_blank" rel="noopener noreferrer" className="sheet-resource-link" aria-label={`Open resource: ${question.title}`}><span>{question.kind === 'concept' ? 'Study' : 'Open'}</span><FiExternalLink /></a>}
          <button type="button" className={question.bookmarked ? 'is-bookmarked' : ''} aria-label={`${question.bookmarked ? 'Remove bookmark' : 'Bookmark'}: ${question.title}`} aria-pressed={!!question.bookmarked} disabled={bookmarkingId === question._id} onClick={() => onToggleBookmark(question._id)}><FiBookmark /></button>
          <button type="button" className={question.note ? 'has-note' : ''} aria-label={`Notes: ${question.title}`} onClick={() => onOpenNotes(question)}><FiEdit3 /></button>
        </div>
      </article>
    </Fragment>)}
  </div>;
}
