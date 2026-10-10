import { LayoutGroup, motion } from "framer-motion";
import useInterfaceMotion from "../hooks/useInterfaceMotion";
import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSun, FaMoon, FaCheck, FaSlidersH, FaShieldAlt, FaDownload, FaArrowRight } from "react-icons/fa";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { changePassword, updateProfile } from "../services/authService";
import { getProgress } from "../services/progressService";
import { invalidateDashboardCache } from "../services/dashboardService";

export default function Settings() {
  const { user, refreshUser, logout } = useAuth();
  const { theme, setTheme, reduceMotion, setReduceMotion } = useTheme();
  const navigate = useNavigate();
  const appearanceId = useId();
  const animate = useInterfaceMotion();
  const [name, setName] = useState(user?.name || "");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState(null);
  const notify = (text, error = false) => setNotice({ text, error });
  async function saveName(event) {
    event.preventDefault(); setBusy("profile"); setNotice(null);
    try { await updateProfile({ name: name.trim() }); await refreshUser(); invalidateDashboardCache(); notify("Profile updated."); }
    catch (error) { notify(error.response?.data?.message || "Could not save your profile. Try again.", true); }
    finally { setBusy(""); }
  }
  async function savePassword(event) {
    event.preventDefault();
    if (passwords.newPassword !== passwords.confirm) return notify("The new passwords do not match.", true);
    setBusy("password"); setNotice(null);
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      logout(); navigate("/login", { state: { message: "Password changed. Log in with your new password." } });
    } catch (error) { notify(error.response?.data?.message || "Could not update your password.", true); }
    finally { setBusy(""); }
  }
  async function exportProgress() {
    setBusy("export"); setNotice(null);
    try {
      const progress = await getProgress({ force: true });
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), progress: progress.data }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = "dsa-roadmap-progress.json"; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notify("Your progress export is ready.");
    } catch { notify("Could not export your progress. Please try again.", true); }
    finally { setBusy(""); }
  }
  return <MainLayout>
    <div className="settings-page">
      <div className="page-intro"><span className="page-kicker"><FaSlidersH /> YOUR WORKSPACE</span><h1>Make it yours<span>.</span></h1><p>A little less friction. A little more focus.</p></div>
      <div className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections"><a href="#appearance">Appearance <FaArrowRight /></a><a href="#account">Account <FaArrowRight /></a><a href="#security">Security <FaArrowRight /></a><a href="#data">Your data <FaArrowRight /></a><div className="settings-tip"><FaShieldAlt /><strong>Your space to grow.</strong><p>Personalize your experience, then get back to making progress.</p></div></nav>
        <div className="settings-panels">
          {notice && <div className={`settings-notice ${notice.error ? "is-error" : ""}`} role={notice.error ? "alert" : "status"}>{notice.text}</div>}
          <section id="appearance" className="settings-card"><div className="settings-section-title"><span>01</span><div><h2>Appearance</h2><p>Choose the workspace that feels right.</p></div></div>
            <LayoutGroup id={appearanceId}><div className="theme-options">{["dark", "light"].map(value => <button key={value} type="button" className={`theme-option ${theme === value ? "selected" : ""}`} aria-pressed={theme === value} onClick={() => setTheme(value)}>{theme === value && <motion.span className="theme-selection-frame" aria-hidden="true" layoutId={animate ? "selected-theme" : undefined} transition={{ duration: animate ? .2 : 0 }} />}<span className={`theme-preview preview-${value}`}><i /><span><b /><b /><b /></span></span><span className="theme-option-label">{value === "dark" ? <FaMoon /> : <FaSun />}{value === "dark" ? "Midnight" : "Daylight"}{theme === value && <FaCheck />}</span></button>)}</div></LayoutGroup>
            <div className="settings-row"><div><h3>Reduced motion</h3><p>Keep transitions quiet and pause decorative animations.</p></div><button type="button" role="switch" aria-checked={reduceMotion} aria-label="Reduced motion" className={`settings-switch ${reduceMotion ? "on" : ""}`} onClick={() => setReduceMotion(value => !value)}><span /></button></div>
            <p className="settings-footnote">Appearance preferences are saved on this device. Your system’s reduced-motion preference is always respected.</p>
          </section>
          <section id="account" className="settings-card"><div className="settings-section-title"><span>02</span><div><h2>Account</h2><p>The details behind your progress.</p></div></div><form onSubmit={saveName} className="settings-form"><label>Display name<input value={name} onChange={event => setName(event.target.value)} required maxLength={80} autoComplete="name" /></label><label>Email address<input value={user?.email || ""} readOnly type="email" /></label><div className="settings-form-footer"><Link to="/profile">Edit profile photo <FaArrowRight /></Link><button disabled={!!busy || !name.trim() || name.trim() === user?.name} className="settings-primary">{busy === "profile" ? "Saving…" : "Save changes"}</button></div></form></section>
          <section id="security" className="settings-card"><div className="settings-section-title"><span>03</span><div><h2>Security</h2><p>Keep your account protected.</p></div></div>{user?.authProvider === "google" ? <p className="settings-footnote">You sign in with Google. Manage your password through your Google account.</p> : <form onSubmit={savePassword} className="settings-form"><label>Current password<input type="password" autoComplete="current-password" required value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} /></label><div className="settings-field-grid"><label>New password<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} /></label><label>Confirm new password<input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} /></label></div><div className="settings-form-footer"><p>At least 8 characters. Changing it signs out your existing sessions.</p><button className="settings-primary" disabled={!!busy}>{busy === "password" ? "Updating…" : "Update password"}</button></div></form>}</section>
          <section id="data" className="settings-card"><div className="settings-section-title"><span>04</span><div><h2>Your data</h2><p>Your learning journey belongs to you.</p></div></div><div className="settings-row"><div><h3>Export your progress</h3><p>Download your solved questions, bookmarks, and notes as JSON.</p></div><button className="settings-secondary" disabled={!!busy} onClick={exportProgress}><FaDownload />{busy === "export" ? "Preparing…" : "Export"}</button></div></section>
        </div>
      </div>
    </div>
  </MainLayout>;
}
