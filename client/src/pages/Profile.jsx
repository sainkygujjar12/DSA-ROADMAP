import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import Loader from "../components/ui/Loader";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  changePassword,
} from "../services/authService";
import { getProgress } from "../services/progressService";

function Profile() {
  const navigate = useNavigate();
  const { user, refreshUser, logout, login, token } = useAuth();

  const [loading, setLoading] = useState(!user);
  const [breakdown, setBreakdown] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });

  // Name editing
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    Promise.all([
      refreshUser(),
      getProgress().catch(() => null),
    ])
      .then(([, progressRes]) => {
        const p = progressRes?.data;
        if (p) {
          setBreakdown({
            easy: p.easySolved || 0,
            medium: p.mediumSolved || 0,
            hard: p.hardSolved || 0,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const startEditingName = () => {
    setNameInput(user?.name || "");
    setEditingName(true);
  };

  const saveName = async () => {
    if (!nameInput.trim()) return;

    try {
      setSavingName(true);
      const res = await updateProfile({ name: nameInput.trim() });
      login(res.data, token);
      setEditingName(false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update name"
      );
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);

    try {
      setSavingPassword(true);
      await changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordMsg({
        type: "success",
        text: "Password updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordMsg({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to update password",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <h2 className="text-center text-white text-2xl">
          User not found
        </h2>
      </DashboardLayout>
    );
  }

  const totalSolved = user.totalSolved || 0;
  const maxDifficulty =
    Math.max(breakdown.easy, breakdown.medium, breakdown.hard) ||
    1;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">

        {/* PROFILE CARD */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-2xl font-bold">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  user.name?.charAt(0)?.toUpperCase()
                )}
              </div>

              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={nameInput}
                      onChange={(e) =>
                        setNameInput(e.target.value)
                      }
                      autoFocus
                      className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-lg font-bold text-white focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      onClick={saveName}
                      disabled={savingName}
                      className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
                    >
                      {savingName ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      className="text-sm text-slate-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">
                      {user.name}
                    </h1>
                    <button
                      onClick={startEditingName}
                      aria-label="Edit name"
                      className="text-slate-500 transition hover:text-cyan-400"
                    >
                      ✏️
                    </button>
                  </div>
                )}

                <p className="text-slate-400">{user.email}</p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                    {user.authProvider === "google"
                      ? "🔵 Google Account"
                      : "✉️ Email Account"}
                  </span>

                  {user.createdAt && (
                    <span className="text-xs text-slate-600">
                      Joined{" "}
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* STATS GRID */}
        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">Total Solved</p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              {totalSolved}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">Streak</p>
            <h2 className="mt-2 text-3xl font-bold text-orange-400">
              🔥 {user.streak || 0}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-slate-400">Role</p>
            <h2 className="mt-2 text-3xl font-bold text-cyan-400 capitalize">
              {user.role}
            </h2>
          </div>

        </div>

        {/* DIFFICULTY BREAKDOWN */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 font-semibold text-white">
            Difficulty Breakdown
          </h3>

          <div className="space-y-3">
            {[
              {
                label: "Easy",
                value: breakdown.easy,
                color: "bg-emerald-500",
              },
              {
                label: "Medium",
                value: breakdown.medium,
                color: "bg-amber-500",
              },
              {
                label: "Hard",
                value: breakdown.hard,
                color: "bg-rose-500",
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-400">
                    {row.label}
                  </span>
                  <span className="text-slate-300">
                    {row.value}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${row.color} transition-all`}
                    style={{
                      width: `${
                        (row.value / maxDifficulty) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PASSWORD (local accounts only) */}
        {user.authProvider !== "google" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <button
              onClick={() =>
                setShowPasswordForm((prev) => !prev)
              }
              className="flex w-full items-center justify-between font-semibold text-white"
            >
              Change Password
              <span className="text-slate-500">
                {showPasswordForm ? "−" : "+"}
              </span>
            </button>

            {showPasswordForm && (
              <form
                onSubmit={handleChangePassword}
                className="mt-4 space-y-3"
              >
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) =>
                    setCurrentPassword(e.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />

                <input
                  type="password"
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                />

                {passwordMsg && (
                  <p
                    className={`text-sm ${
                      passwordMsg.type === "success"
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {passwordMsg.text}
                  </p>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  disabled={savingPassword}
                >
                  {savingPassword
                    ? "Updating..."
                    : "Update Password"}
                </Button>
              </form>
            )}
          </div>
        )}

        {/* DANGER ZONE */}
        <div className="rounded-2xl border border-rose-900/40 bg-rose-950/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white">
                Log out
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                You'll need to sign in again to access your
                dashboard and progress.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="shrink-0 rounded-lg border border-rose-800/60 px-5 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-950/60 hover:text-rose-300"
            >
              Logout
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default Profile;
