import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
export default function NotFound() {
  return <MainLayout><div className="recovery-page"><span className="page-kicker">404 · OFF THE ROADMAP</span><h1>Let’s get you back on track.</h1><p>This page doesn’t exist, but your next challenge is waiting.</p><Link className="settings-primary" to="/roadmap">Explore the roadmap</Link><Link to="/">Back to home</Link></div></MainLayout>;
}
