import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCamera,
  FaCheck,
  FaFire,
  FaPencilAlt,
  FaTrophy,
  FaTrash,
  FaSlidersH,
} from "react-icons/fa";

import MainLayout from "../components/layout/MainLayout";
import Loader from "../components/ui/Loader";
import ActivityHeatmap from "../components/progress/ActivityHeatmap";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/authService";
import { getDashboard, invalidateDashboardCache } from "../services/dashboardService";
import "./workspace.css";

const currentYear = new Date().getFullYear();

const difficultyRows = [
  { key: "easy", label: "Easy", color: "easy" },
  { key: "medium", label: "Medium", color: "medium" },
  { key: "hard", label: "Hard", color: "hard" },
];

function resizeAvatar(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read that image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That image could not be opened."));
      image.onload = () => {
        const size = 360;
        const scale = Math.min(1, size / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

function Profile() {
  const { user, refreshUser, login, token } = useAuth();
  const avatarInputRef = useRef(null);

  const [loading, setLoading] = useState(!user);
  const [breakdown, setBreakdown] = useState({ easy: 0, medium: 0, hard: 0 });
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [activity, setActivity] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [year, setYear] = useState(currentYear);
  const [loadMessage, setLoadMessage] = useState("");

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [avatarMessage, setAvatarMessage] = useState("");
  const [nameMessage, setNameMessage] = useState("");

  const applyDashboard = (response) => {
    const dashboard = response?.data;
    const stats = dashboard?.stats;
    if (!stats) return;

    setBreakdown({
      easy: stats.easySolved || 0,
      medium: stats.mediumSolved || 0,
      hard: stats.hardSolved || 0,
    });
    setTotalSolved(stats.totalSolved || 0);
    setTotalQuestions(stats.totalQuestions || 0);
    setActivity(dashboard.activity || []);
    setStreak(stats.streak || 0);
    setBestStreak(stats.bestStreak || stats.streak || 0);
  };

  useEffect(() => {
    let active = true;

    Promise.allSettled([refreshUser(), getDashboard({ force: true })])
      .then(([userResponse, dashboardResponse]) => {
        if (!active) return;
        if (dashboardResponse.status === "fulfilled") applyDashboard(dashboardResponse.value);
        else setLoadMessage("Your progress is temporarily unavailable. Refresh to try again.");
        if (userResponse.status === "rejected") setLoadMessage("We could not refresh your account details. Your saved profile is shown below.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // Auth methods are stable for this one-time page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const refreshProgress = () => {
      getDashboard({ force: true })
        .then(applyDashboard)
        .catch((error) => console.error("Profile progress refresh error:", error));
    };

    window.addEventListener("progress:updated", refreshProgress);
    return () => window.removeEventListener("progress:updated", refreshProgress);
  }, []);

  const startEditingName = () => {
    setNameInput(user?.name || "");
    setNameMessage("");
    setEditingName(true);
  };

  const saveName = async (event) => {
    event.preventDefault();
    if (!nameInput.trim()) return;

    try {
      setSavingName(true);
      const response = await updateProfile({ name: nameInput.trim() });
      login(response.data, token);
      invalidateDashboardCache();
      setEditingName(false);
      setNameMessage("Your name has been updated.");
    } catch (error) {
      setNameMessage(error.response?.data?.message || "Could not update your name. Try again.");
    } finally {
      setSavingName(false);
    }
  };

  const saveAvatar = async (avatar) => {
    try {
      setSavingAvatar(true);
      setAvatarMessage("");
      const response = await updateProfile({ avatar });
      login(response.data, token);
      invalidateDashboardCache();
      setAvatarMessage(avatar ? "Profile photo updated." : "Profile photo removed.");
    } catch (error) {
      setAvatarMessage(error.response?.data?.message || "Could not update profile photo.");
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarMessage("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarMessage("Please choose an image smaller than 5 MB.");
      return;
    }

    try {
      await saveAvatar(await resizeAvatar(file));
    } catch (error) {
      setAvatarMessage(error.message || "Could not read that image.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Loader />
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <h2 className="text-center text-2xl text-white">User not found</h2>
      </MainLayout>
    );
  }

  const overallProgress = totalQuestions
    ? Math.min(100, Math.round((totalSolved / totalQuestions) * 100))
    : 0;
  const maxDifficulty = Math.max(
    breakdown.easy,
    breakdown.medium,
    breakdown.hard,
    1
  );
  const yearSolved = activity
    .filter((entry) => entry.date?.startsWith(`${year}-`))
    .reduce((sum, entry) => sum + (Number(entry.count) || 0), 0);

  return (
    <MainLayout>
      <div className="profile-page">
        <header className="profile-page-heading">
          <div>
            <p className="eyebrow-label">Your progress</p>
            <h1>Profile<span>.</span></h1>
            <p>Keep your practice history and progress in one place.</p>
          </div>
          <Link to="/settings" className="settings-secondary"><FaSlidersH /> Account settings</Link>
        </header>

        {loadMessage && <p className="profile-data-notice" role="status">{loadMessage}</p>}

        <div className="profile-layout">
          <aside className="profile-identity-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {user.avatar ? (
                  <img src={user.avatar} alt={`${user.name}'s profile`} />
                ) : (
                  user.name?.charAt(0)?.toUpperCase()
                )}
              </div>
              <div className="profile-photo-actions">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={savingAvatar}
                  className="profile-photo-button"
                >
                  <FaCamera /> {savingAvatar ? "Saving..." : "Change photo"}
                </button>
                {user.avatar && (
                  <button
                    type="button"
                    onClick={() => saveAvatar("")}
                    disabled={savingAvatar}
                    className="profile-remove-photo"
                  >
                    <FaTrash /> Remove
                  </button>
                )}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
              </div>
              {avatarMessage && <p className="profile-avatar-message" role="status">{avatarMessage}</p>}
            </div>

            <div className="profile-identity-copy">
              {editingName ? (
                <form className="profile-name-editor" onSubmit={saveName}>
                  <input
                    value={nameInput}
                    onChange={(event) => setNameInput(event.target.value)}
                    autoFocus
                    aria-label="Your name"
                    autoComplete="name"
                    required
                    maxLength={80}
                  />
                  <button type="submit" disabled={savingName || !nameInput.trim()} aria-label="Save name">
                    {savingName ? "..." : <FaCheck />}
                  </button>
                  <button type="button" onClick={() => setEditingName(false)} aria-label="Cancel editing name">
                    ×
                  </button>
                </form>
              ) : (
                <div className="profile-name-row">
                  <h2>{user.name}</h2>
                  <button type="button" onClick={startEditingName} aria-label="Edit name">
                    <FaPencilAlt />
                  </button>
                </div>
              )}
              {nameMessage && <div className="profile-save-notice" role="status">{nameMessage}</div>}
              <p>{user.email}</p>
              <span className="profile-account-badge">
                {user.authProvider === "google" ? "Google account" : "Email account"}
              </span>
            </div>

            <div className="profile-identity-footer">
              <span>Questions solved</span>
              <strong>{totalSolved} / {totalQuestions || "—"}</strong>
            </div>
          </aside>

          <main className="profile-main-content">
            <section className="profile-activity-card">
              <div className="profile-activity-heading">
                <div>
                  <p className="eyebrow-label">Your consistency</p>
                  <h2>Activity heatmap</h2>
                  <p>{yearSolved} question{yearSolved === 1 ? "" : "s"} solved in {year}.</p>
                </div>
                <select value={year} onChange={(event) => setYear(Number(event.target.value))} aria-label="Heatmap year">
                  {Array.from({ length: 5 }, (_, index) => <option key={currentYear - index}>{currentYear - index}</option>)}
                </select>
              </div>
              <ActivityHeatmap activity={activity} year={year} />
            </section>

            <section className="profile-stat-grid">
              <div className="profile-stat-card profile-stat-total">
                <div className="profile-stat-copy">
                  <span>Total solved</span>
                  <strong>{totalSolved} <small>/ {totalQuestions || "—"}</small></strong>
                  <em>{overallProgress}% complete</em>
                </div>
                <div className="profile-stat-ring" style={{ "--progress": `${overallProgress * 3.6}deg` }}>
                  <span>{overallProgress}%</span>
                </div>
              </div>
              <div className="profile-stat-card">
                <span>Current streak</span>
                <strong className="orange"><FaFire /> {streak}</strong>
                <em>consecutive days</em>
              </div>
              <div className="profile-stat-card">
                <span>Best streak</span>
                <strong className="cyan"><FaTrophy /> {bestStreak}</strong>
                <em>days your best</em>
              </div>
            </section>

            <section className="profile-difficulty-card">
              <div className="profile-section-title">
                <div>
                  <p className="eyebrow-label">Solved questions</p>
                  <h2>Difficulty breakdown</h2>
                </div>
                <strong>{totalSolved} total</strong>
              </div>
              <div className="profile-difficulty-list">
                {difficultyRows.map((row) => (
                  <div className="profile-difficulty-row" key={row.key}>
                    <div><span className={row.color}>{row.label}</span><strong>{breakdown[row.key]}</strong></div>
                    <div className="profile-difficulty-track"><span className={row.color} style={{ width: `${(breakdown[row.key] / maxDifficulty) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;
