import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  loginUser,
  verifyOtp,
  resendOtp,
} from "../services/authService";
import { useAuth } from "../context/AuthContext";
import GoogleAuthButton from "../components/auth/GoogleAuthButton";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] =
    useState(false);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const response = await loginUser(form);

      login(response.data, response.token);
      navigate("/dashboard");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed";

      setError(message);

      if (message.toLowerCase().includes("verify")) {
        setNeedsVerification(true);
        resendOtp(form.email).catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setSubmitting(true);
      const res = await verifyOtp({
        email: form.email,
        otp,
      });

      login(res.data, res.token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Verification failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="w-full max-w-md rounded-xl bg-slate-900 p-8">
          <h1 className="mb-2 text-center text-3xl font-bold text-white">
            Verify your email
          </h1>

          <p className="mb-6 text-center text-sm text-slate-400">
            We've sent a fresh 6-digit code to{" "}
            <span className="text-slate-200">
              {form.email}
            </span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              required
              maxLength={6}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white"
            />

            {error && (
              <p className="text-sm text-rose-400">{error}</p>
            )}

            <button
              disabled={submitting || otp.length !== 6}
              className="w-full rounded-lg bg-cyan-600 py-3 text-white hover:bg-cyan-500 disabled:opacity-50"
            >
              {submitting ? "Verifying..." : "Verify"}
            </button>
          </form>

          <button
            onClick={() => {
              setNeedsVerification(false);
              setError("");
            }}
            className="mt-4 w-full text-center text-sm text-slate-500 hover:text-slate-300"
          >
            ← Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-xl bg-slate-900 p-8">

        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Login
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
          />

          {error && (
            <p className="text-sm text-rose-400">{error}</p>
          )}

          <button
            disabled={submitting}
            className="w-full rounded-lg bg-cyan-600 py-3 text-white hover:bg-cyan-500 disabled:opacity-50"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-500">OR</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <GoogleAuthButton />

        <p className="mt-6 text-center text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-cyan-500"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
