import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/auth/AuthShell";
import { confirmResetPassword } from "../services/authService";

function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasToken, setHasToken] = useState(() => Boolean(sessionStorage.getItem("resetToken")));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!sessionStorage.getItem("resetToken")) {
      setHasToken(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      await confirmResetPassword({
        token: sessionStorage.getItem("resetToken"),
        newPassword,
      });
      sessionStorage.removeItem("resetToken");
      sessionStorage.removeItem("resetEmail");
      setMessage("Password reset successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1600);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Almost done"
      title="Create a new password"
      description="Choose a strong password you’ll remember for your next session."
    >
      {!hasToken ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-300">
          Your reset session has expired. <Link to="/forgot-password" className="font-semibold underline">Request a new code.</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-slate-300">
            New password
            <input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
              className="auth-input mt-2 w-full rounded-xl px-4 py-3.5"
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Confirm password
            <input
              type="password"
              placeholder="Repeat your new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              className="auth-input mt-2 w-full rounded-xl px-4 py-3.5"
            />
          </label>

          {error && <p className="text-sm text-rose-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}

          <button
            disabled={submitting}
            className="w-full rounded-xl bg-[#665cff] py-3.5 font-semibold text-white transition hover:bg-[#756cff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Updating password..." : "Update password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default ResetPassword;
