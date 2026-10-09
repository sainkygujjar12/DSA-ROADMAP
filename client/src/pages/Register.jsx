import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthShell from "../components/auth/AuthShell";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";
import { useAuth } from "../context/AuthContext";
import { registerUser, resendOtp, verifyOtp } from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
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
      await registerUser(form);
      setStep("otp");
      setResendCooldown(30);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Registration failed");
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

  if (step === "otp") {
    return (
      <AuthShell
        eyebrow="One quick step"
        title="Verify your email"
        description={`We sent a 6-digit code to ${form.email}.`}
      >
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
            onClick={() => setStep("form")}
            className="text-slate-500 transition hover:text-white"
          >
            Back
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Start your journey"
      title="Create your account"
      description="Save your progress, build a streak, and prepare with a plan."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-medium text-slate-300">
          Name
          <input
            type="text"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
            className="auth-input mt-2 w-full rounded-xl px-4 py-3.5"
          />
        </label>

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
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="auth-input mt-2 w-full rounded-xl px-4 py-3.5"
          />
        </label>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          disabled={submitting}
          className="w-full rounded-xl bg-[#665cff] py-3.5 font-semibold text-white transition hover:bg-[#756cff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Sending code..." : "Create account"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-slate-500">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleAuthButton />

      <p className="mt-7 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-[#00c99a] hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export default Register;
