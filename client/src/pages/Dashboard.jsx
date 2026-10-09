import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaChartLine,
  FaFire,
  FaPencilAlt,
  FaTrophy,
  FaEnvelope,
  FaCheck,
} from "react-icons/fa";

import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/ui/Loader";
import ActivityHeatmap from "../components/progress/ActivityHeatmap";
import { getDashboard } from "../services/dashboardService";
import { getTopics } from "../services/topicService";
import TopicIcon from "../components/common/TopicIcon";
import "./workspace.css";

const currentYear = new Date().getFullYear();
const percent = value => Math.min(100, Math.max(0, Number(value) || 0));

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(currentYear);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getDashboard(), getTopics()])
      .then(([dashboardResponse, topicsResponse]) => {
        if (cancelled) return;
        setStats(dashboardResponse?.data || null);
        setTopics(topicsResponse?.data || []);
      })
      .catch((error) => {
        if (!cancelled) console.error("Dashboard error:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    const refreshProgress = () => {
      Promise.all([
        getDashboard({ force: true }),
        getTopics(),
      ])
        .then(([dashboardResponse, topicsResponse]) => {
          setStats(dashboardResponse?.data || null);
          setTopics(topicsResponse?.data || []);
        })
        .catch((error) => console.error("Dashboard refresh error:", error));
    };

    window.addEventListener("progress:updated", refreshProgress);
    return () => window.removeEventListener("progress:updated", refreshProgress);
  }, []);

  const courseTopics = useMemo(() => [...topics].sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 6), [topics]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[70vh] items-center justify-center"><Loader /></div>
      </MainLayout>
    );
  }

  if (!stats) {
    return (
      <MainLayout>
        <div className="workspace-empty"><h1>Your dashboard could not load</h1><p>Your progress is saved. Try connecting again.</p><button className="settings-primary" onClick={() => { setLoading(true); setAttempt(value => value + 1); }}>Try again</button></div>
      </MainLayout>
    );
  }

  const user = stats.user || {};
  const progress = stats.stats || {};
  const activityForYear = (stats.activity || []).filter((entry) => entry.date?.startsWith(`${year}-`));
  const activitySolveCount = activityForYear.reduce((sum, entry) => sum + (entry.count || 0), 0);

  return (
    <MainLayout>
      <header className="dashboard-welcome"><div><p className="eyebrow-label">Your workspace</p><h1>A little progress, every day<span>.</span></h1><p>Pick up where you left off. Your next small win is waiting.</p></div><Link className="settings-secondary" to="/roadmap">Continue learning <FaArrowRight /></Link></header>
      <div className="dashboard-page">
        <aside className="dashboard-rail">
          <section className="dashboard-profile-card">
            <div className="dashboard-avatar">
              {user.avatar ? <img src={user.avatar} alt="" /> : user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h2>{user.name || "Learner"}</h2>
            <p className="dashboard-handle">@{(user.name || "learner").replace(/\s+/g, "").toLowerCase()}</p>
            <div className="dashboard-profile-email"><FaEnvelope aria-hidden="true" /> {user.email || "No email"}</div>
            <Link to="/profile" className="dashboard-edit-button"><FaPencilAlt /> Edit Profile</Link>
          </section>

          <div className="dashboard-streak-grid">
            <div><FaFire /><span>Current Streak<strong>{progress.streak || 0} days</strong></span></div>
            <div><FaTrophy /><span>Best Streak<strong>{progress.bestStreak || progress.streak || 0} days</strong></span></div>
          </div>

          <section className="dashboard-all-card">
            <div className="dashboard-card-heading"><strong>All questions</strong><span>{progress.totalSolved || 0} solved</span></div>
            <div className="dashboard-all-stat-row">
              <div><b className="easy-text">Easy</b><span>{progress.easySolved || 0}</span></div>
              <div><b className="medium-text">Medium</b><span>{progress.mediumSolved || 0}</span></div>
              <div><b className="hard-text">Hard</b><span>{progress.hardSolved || 0}</span></div>
            </div>
            <MiniProgressRing value={progress.overallProgress || 0} total={progress.totalQuestions || 0} solved={progress.totalSolved || 0} />
          </section>
        </aside>

        <main className="dashboard-main">
          <section className="dashboard-activity-card">
            <div className="dashboard-activity-heading">
              <div><FaChartLine /><strong>{activitySolveCount} solves in {year}</strong></div>
              <div className="dashboard-activity-controls"><span>{activityForYear.filter(entry => entry.count > 0).length} active days</span><select aria-label="Activity year" value={year} onChange={(event) => setYear(Number(event.target.value))}>{Array.from({ length: 5 }, (_, index) => <option key={currentYear - index}>{currentYear - index}</option>)}</select></div>
            </div>
            <ActivityHeatmap year={year} activity={stats.activity || []} />
            <p className="dashboard-activity-note">{activitySolveCount ? "Every square is a step forward. Keep the momentum going." : "Your activity will appear here as you solve questions."}</p>
          </section>

          <section className="dashboard-progress-section">
            <div className="dashboard-section-heading">
              <div><h2>Your progress</h2><p>Build a strong foundation, one topic at a time.</p></div>
              <Link to="/roadmap">View roadmap <FaArrowRight /></Link>
            </div>
            <div className="dashboard-course-grid">
              {courseTopics.length ? courseTopics.map((topic, index) => (
                <Link key={topic._id} to={`/roadmap/${topic.slug}`} className={`dashboard-course-card ${percent(topic.progress) === 100 ? "is-complete" : ""}`} style={{ "--card-order": index }}>
                  <div className="dashboard-topic-top"><TopicIcon slug={topic.slug} /><span className="dashboard-topic-state">{percent(topic.progress) === 100 ? <><FaCheck /> Complete</> : topic.solvedQuestions > 0 ? "In progress" : "Ready to start"}</span></div>
                  <h3>{topic.name}</h3>
                  <p className="dashboard-topic-description">{topic.description || "Explore the essentials and put them into practice."}</p>
                  <div className="dashboard-course-progress" role="progressbar" aria-label={`${topic.name} progress`} aria-valuenow={percent(topic.progress)} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent(topic.progress)}%` }} /></div>
                  <div className="dashboard-course-footer"><span>{topic.solvedQuestions || 0} / {topic.totalQuestions || 0} solved</span><strong>{Math.round(percent(topic.progress))}% <FaArrowRight aria-hidden="true" /></strong></div>
                </Link>
              )) : (
                <div className="dashboard-empty">Your courses will appear here.</div>
              )}
            </div>
          </section>
        </main>
      </div>
    </MainLayout>
  );
}

function MiniProgressRing({ value, total, solved }) {
  const angle = `${percent(value) * 3.6}deg`;

  return (
    <div className="dashboard-mini-ring" style={{ background: `conic-gradient(var(--app-accent) ${angle}, var(--app-border) ${angle} 360deg)` }}>
      <div><strong>{solved}</strong><span>/{total}</span><small>Solved</small></div>
    </div>
  );
}

export default Dashboard;
