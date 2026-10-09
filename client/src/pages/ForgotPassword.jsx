import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthShell from "../components/auth/AuthShell";
import { requestPasswordReset } from "../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      await requestPasswordReset(email);
      sessionStorage.setItem("resetEmail", email);
      navigate("/verify-reset-otp");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to request password reset");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="We’ll send a one-time verification code to your email."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-medium text-slate-300">
          Email address
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="auth-input mt-2 w-full rounded-xl px-4 py-3.5"
          />
        </label>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          disabled={submitting}
          className="w-full rounded-xl bg-[#665cff] py-3.5 font-semibold text-white transition hover:bg-[#756cff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Sending code..." : "Send verification code"}
        </button>
      </form>
    </AuthShell>
  );
}

export default ForgotPassword;
