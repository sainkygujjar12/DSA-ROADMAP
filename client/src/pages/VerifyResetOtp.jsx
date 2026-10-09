import { useState } from "react";
import { useNavigate } from "react-router-dom";

import AuthShell from "../components/auth/AuthShell";
import { verifyResetOtp } from "../services/authService";

function VerifyResetOtp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(sessionStorage.getItem("resetEmail") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const response = await verifyResetOtp({ email, otp });
      sessionStorage.setItem("resetEmail", email);
      sessionStorage.setItem("resetToken", response.token);
      navigate("/reset-password");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Invalid verification code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Verify the code"
      description="Enter the code from your email to create a new password."
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

        <label className="block text-sm font-medium text-slate-300">
          Verification code
          <input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            maxLength={6}
            className="auth-input mt-2 w-full rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em]"
          />
        </label>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          disabled={submitting || otp.length !== 6}
          className="w-full rounded-xl bg-[#665cff] py-3.5 font-semibold text-white transition hover:bg-[#756cff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Checking code..." : "Continue"}
        </button>
      </form>
    </AuthShell>
  );
}

export default VerifyResetOtp;
