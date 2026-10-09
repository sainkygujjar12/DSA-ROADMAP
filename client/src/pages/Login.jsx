import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import AuthShell from "../components/auth/AuthShell";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import { useAuth } from "../context/AuthContext";
import {
  loginUser,
  resendOtp,
  verifyOtp,
} from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return undefined;
    const timer = setInterval(() => {
      setResendCooldown((value) => Math.max(value - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (event) => {
    setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const response = await loginUser(form);
      login(response.data, response.token);
      navigate("/dashboard");
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Login failed";
      setError(message);
      if (message.toLowerCase().includes("verify")) {
        setNeedsVerification(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const response = await verifyOtp({ email: form.email, otp });
      login(response.data, response.token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      setResending(true);
      await resendOtp(form.email);
      setResendCooldown(30);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  if (needsVerification) {
    return (
      <AuthShell
        eyebrow="Almost there"
        title="Verify your email"
        description={`Enter the 6-digit code sent to ${form.email}.`}
      >
        {location.state?.message && <p role="status" className="settings-notice">{location.state.message}</p>}
      <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            inputMode="numeric"
            placeholder="000000"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            maxLength={6}
            className="auth-input w-full rounded-xl px-4 py-4 text-center text-2xl tracking-[0.5em]"
          />

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <button
            disabled={submitting || otp.length !== 6}
            className="w-full rounded-xl bg-[#665cff] py-3.5 font-semibold text-white transition hover:bg-[#756cff] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          {resendCooldown > 0 ? (
            <span className="text-slate-500">Resend code in {resendCooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-[#00c99a] hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setNeedsVerification(false);
              setError("");
            }}
            className="text-slate-500 transition hover:text-white"
          >
            Back to login
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to your roadmap"
      description="Pick up where you left off and keep your preparation moving."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">
          Email address
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            className="auth-input mt-2 w-full rounded-xl px-4 py-3.5"
          />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Password
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
            className="auth-input mt-2 w-full rounded-xl px-4 py-3.5"
          />
        </label>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-[#00c99a] hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          disabled={submitting}
          className="w-full rounded-xl bg-[#665cff] py-3.5 font-semibold text-white transition hover:bg-[#756cff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Continue"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-slate-500">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleAuthButton />

      <p className="mt-7 text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-[#00c99a] hover:underline">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}

export default Login;
