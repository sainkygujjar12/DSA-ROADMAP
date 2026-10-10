import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaArrowRight, FaCheck, FaCode } from "react-icons/fa";
import AnimatedTabs from "../ui/AnimatedTabs";
import { getSheets } from "../../services/sheetService";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";
import { getStats } from "../../services/statsService";

const previewTopics = ["arrays", "strings", "linked-list", "binary-search", "trees", "dynamic-programming"];
export default function Hero({ roadmap }) {
  const [stats, setStats] = useState(null);
  const [sheets, setSheets] = useState(null);
  const [sheetsError, setSheetsError] = useState(false);
  useEffect(() => {
    let active = true;
    getStats().then(response => { if (active) setStats(response.data); }).catch(() => {});
    getSheets().then(response => { if (active) setSheets(response.data || []); }).catch(() => { if (active) setSheetsError(true); });
    return () => { active = false; };
  }, []);
  const solved = roadmap.topics.reduce((total, topic) => total + (topic.solvedQuestions || 0), 0);
  return <section className="premium-hero landing-container">
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45 }} className="premium-hero-copy">
      <span className="page-kicker"><span className="hero-status-dot" /> A LITTLE PRACTICE. A LOT OF POSSIBILITY.</span>
      <h1>Your next chapter<br />starts with <span>one problem.</span></h1>
      <p>A clear roadmap. Real interview questions. A workspace that keeps your progress in sight and your next step simple.</p>
      <div className="premium-hero-actions"><Link to={roadmap.isAuthenticated ? "/dashboard" : "/roadmap"} className="settings-primary">{roadmap.isAuthenticated ? "Continue learning" : "Find your starting point"} <FaArrowRight /></Link><Link to="/companies">Explore companies <FaArrowRight /></Link></div>
      <div className="premium-hero-proof"><span><FaCheck /> Learn at your pace</span><span><FaCheck /> Track every win</span></div>
      <div className="premium-hero-stats">{[[stats?.totalQuestions, "Questions"], [stats?.totalCompanies, "Companies"], [stats?.totalTopics, "Topics"]].map(([value, label]) => <div key={label}><strong>{value?.toLocaleString() || "—"}</strong><span>{label}</span></div>)}</div>
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .1 }} className="hero-workspace">
      <div className="hero-workspace-top"><span><FaCode /> YOUR LEARNING PATH</span><i /><i /><i /></div>
      <div className="hero-workspace-heading"><div><p>{roadmap.isAuthenticated ? "WELCOME BACK" : "ONE STEP AT A TIME"}</p><h2>{roadmap.isAuthenticated ? "Keep your momentum." : "Build a strong foundation."}</h2></div><span className="hero-progress-label">{roadmap.isAuthenticated ? `${solved} solved` : "Start here"}</span></div>
      <AnimatedTabs label="Practice preview" tabs={[{ title: "By topic", value: "topics", content: <div className="hero-path-list">{previewTopics.map((slug, index) => {
        const topic = roadmap.topics.find(topic => topic.slug === slug);
        const count = roadmap.isAuthenticated ? topic?.solvedQuestions || 0 : 0;
        const total = topic?.totalQuestions || 0;
        const progress = total ? Math.min(100, count / total * 100) : 0;
        return <Link key={slug} to={`/roadmap/${slug}`} className="hero-path-card"><span className="hero-path-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{topic?.name || slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}</h3><p>{roadmap.loading ? "Loading…" : roadmap.error ? "Explore topic" : roadmap.isAuthenticated ? `${count} of ${total} solved` : `${total} questions`}</p>{roadmap.isAuthenticated && <span className="hero-path-progress"><span style={{width:`${progress}%`}} /></span>}</div><FaArrowRight /></Link>;
      })}</div> }, { title: "By sheet", value: "sheets", content: <div className="hero-sheet-list">
        {sheetsError ? <p className="hero-preview-message">Collections could not load. <Link to="/sheets">Browse practice sheets</Link></p> : sheets === null ? <p className="hero-preview-message" role="status">Loading collections…</p> : sheets.length ? sheets.slice(0, 3).map(sheet => <Link to={`/sheets/${sheet.slug}`} key={sheet._id || sheet.slug} className="hero-sheet-card"><span className="hero-sheet-icon"><FiBookOpen /></span><div><h3>{sheet.name}</h3><p>{sheet.totalQuestions || 0} questions{sheet.sectionCount ? ` · ${sheet.sectionCount} sections` : ""}</p></div><FiArrowUpRight /></Link>) : <p className="hero-preview-message">Collections will appear here when available.</p>}
        <Link to="/sheets" className="hero-sheets-browse">Explore all collections <FaArrowRight /></Link>
      </div> }]} />
      <Link to="/roadmap" className="hero-workspace-footer">View the full roadmap <FaArrowRight /></Link>
    </motion.div>
  </section>;
}
