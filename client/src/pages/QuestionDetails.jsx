import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBookmark,
  FaBookOpen,
  FaCheck,
  FaExternalLinkAlt,
  FaFileAlt,
  FaPlay,
} from "react-icons/fa";

import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/ui/Loader";
import CompanyIcon from "../components/ui/CompanyIcon";
import NotesSection from "../components/question/NotesSection";

import { getQuestionBySlug } from "../services/questionService";
import {
  getProgress,
  toggleQuestionSolved,
  toggleBookmark,
  updateLastVisited,
} from "../services/progressService";

const difficultyClass = {
  Easy: "question-difficulty-easy",
  Medium: "question-difficulty-medium",
  Hard: "question-difficulty-hard",
};

function QuestionDetails() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [solved, setSolved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [questionResponse, progressResponse] = await Promise.all([
          getQuestionBySlug(slug),
          getProgress(),
        ]);
        const questionData = questionResponse?.data || null;
        if (cancelled) return;
        setQuestion(questionData);
        if (!questionData?._id) return;

        await updateLastVisited(questionData._id);
        if (cancelled) return;

        const progress = progressResponse?.data || {};
        const solvedIds = (progress.solvedQuestions || []).map((item) => item?._id);
        const bookmarkedIds = (progress.bookmarkedQuestions || []).map((item) => item?._id);
        const existingNote = (progress.notes || []).find(
          (item) => item?.question?._id === questionData._id
        );

        setSolved(solvedIds.includes(questionData._id));
        setBookmarked(bookmarkedIds.includes(questionData._id));
        setNote(existingNote?.content || "");
      } catch (error) {
        console.error("QuestionDetails error:", error);
        if (!cancelled) setQuestion(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleSolved = async () => {
    if (!question?._id) return;
    try {
      setSaving(true);
      await toggleQuestionSolved(question._id);
      setSolved((previous) => !previous);
    } catch (error) {
      console.error(error);
      alert("Failed to update question status.");
    } finally {
      setSaving(false);
    }
  };

  const handleBookmark = async () => {
    if (!question?._id) return;
    try {
      setBookmarking(true);
      await toggleBookmark(question._id);
      setBookmarked((previous) => !previous);
    } catch (error) {
      console.error(error);
      alert("Failed to update bookmark.");
    } finally {
      setBookmarking(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center"><Loader /></div>
      </MainLayout>
    );
  }

  if (!question) {
    return (
      <MainLayout>
        <div className="question-not-found">
          <h2>Question not found</h2>
          <Link to="/roadmap">Return to roadmap</Link>
        </div>
      </MainLayout>
    );
  }

  const topicLink = question.topic?.slug ? `/roadmap/${question.topic.slug}` : "/roadmap";

  return (
    <MainLayout>
      <div className="question-detail-page">
        <Link to={topicLink} className="question-back-link">
          <FaArrowLeft /> Back to {question.topic?.name || "practice"}
        </Link>

        <div className="question-detail-layout">
          <main>
            <section className="question-detail-hero">
              <div className="question-detail-kicker">{question.kind === "concept" ? "Study concept" : "Coding interview question"}</div>
              <div className="question-title-row">
                <div>
                  <h1>{question.title}</h1>
                  <div className="question-meta-row">
                    <span>{question.topic?.name || "DSA"}</span>
                    <span>•</span>
                    <span className={difficultyClass[question.difficulty]}>{question.difficulty}</span>
                    {question.leetcodeNumber && <span>LeetCode #{question.leetcodeNumber}</span>}
                  </div>
                </div>
                {solved && <span className="question-solved-badge"><FaCheck /> Solved</span>}
              </div>

              <div className="question-action-row">
                <button type="button" className={`question-primary-action ${solved ? "is-solved" : ""}`} onClick={handleSolved} disabled={saving}>
                  <FaCheck /> {saving ? "Saving..." : solved ? "Solved" : "Mark as solved"}
                </button>
                <button type="button" className={`question-secondary-action ${bookmarked ? "is-bookmarked" : ""}`} onClick={handleBookmark} disabled={bookmarking}>
                  <FaBookmark /> {bookmarked ? "Bookmarked" : "Save question"}
                </button>
              </div>
            </section>

            <section className="question-detail-section">
              <div className="question-section-heading"><span>01</span><h2>{question.kind === "concept" ? "Explore this concept" : "Practice this problem"}</h2></div>
              <p className="question-detail-copy">Work through the problem first, then use the resources on the right when you need a hint or explanation.</p>
              <div className="question-resource-buttons">
                {question.leetcodeUrl && <ExternalResource href={question.leetcodeUrl} label={question.isPremium ? "Solve on LeetCode (Premium)" : "Solve on LeetCode"} icon={<FaExternalLinkAlt />} primary />}
                {question.gfgUrl && <ExternalResource href={question.gfgUrl} label="Open GeeksforGeeks" icon={<FaExternalLinkAlt />} />}
                {question.resourceUrl && !question.leetcodeUrl && !question.gfgUrl && <ExternalResource href={question.resourceUrl} label={question.kind === "concept" ? "Study concept" : "Open question reference"} icon={<FaBookOpen />} primary />}
                {question.youtubeUrl && <ExternalResource href={question.youtubeUrl} label="Watch explanation" icon={<FaPlay />} />}
                {question.articleUrl && <ExternalResource href={question.articleUrl} label="Read article" icon={<FaFileAlt />} />}
              </div>
            </section>

            <section className="question-detail-section">
              <div className="question-section-heading"><span>02</span><h2>Your notes</h2></div>
              <NotesSection key={`${question._id}-${note}`} questionId={question._id} initialNote={note} />
            </section>
          </main>

          <aside className="question-detail-aside">
            <section className="question-info-card">
              <h2>Question details</h2>
              <InfoRow label="Difficulty" value={question.difficulty} tone={difficultyClass[question.difficulty]} />
              <InfoRow label="Topic" value={question.topic?.name || "DSA"} />
              <div className="question-info-block">
                <span>Patterns</span>
                <div className="question-chip-list">
                  {(question.tags || []).length ? question.tags.map((tag) => <span key={tag}>{tag}</span>) : <em>No patterns tagged</em>}
                </div>
              </div>
            </section>

            <section className="question-info-card">
              <h2>Companies</h2>
              <div className="question-company-list">
                {(question.companies || []).length ? question.companies.map((company) => (
                  <div key={company._id || company.slug} className="question-company-item">
                    <CompanyIcon company={company} size="sm" />
                    <span>{company.name}</span>
                  </div>
                )) : <p className="question-empty">No companies tagged</p>}
              </div>
            </section>

            <section className="question-info-card">
              <h2>Included in</h2>
              <div className="question-chip-list">
                {(question.sheets || []).length ? question.sheets.map((sheet) => <span key={sheet._id || sheet.slug}>{sheet.name}</span>) : <em>No sheets linked</em>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}

function ExternalResource({ href, label, icon, primary = false }) {
  if (typeof href !== "string" || !/^https?:\/\//.test(href)) return null;
  return (
    <a className={`question-resource-button ${primary ? "primary" : ""}`} href={href} target="_blank" rel="noreferrer">
      {icon}<span>{label}</span><FaExternalLinkAlt className="resource-arrow" />
    </a>
  );
}

function InfoRow({ label, value, tone }) {
  return <div className="question-info-row"><span>{label}</span><strong className={tone || ""}>{value}</strong></div>;
}

export default QuestionDetails;
