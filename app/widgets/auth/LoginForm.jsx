"use client";

import { useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";

export default function LoginForm({ onOtpRequested }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);

      /*
       * Real server-side OTP request will go here later.
       *
       * const result = await requestOtp(trimmedEmail);
       *
       * if (!result?.success) {
       *   throw new Error(result?.message || "Unable to send OTP");
       * }
       */

      onOtpRequested(trimmedEmail);
    } catch (error) {
      setError(error?.message || "Unable to send OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <h4>Welcome Back</h4>

      <div className="sub-wrapper-cntnt">
        <p>
          Enter your email address and we&apos;ll send you a secure one-time
          password to access your account.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              placeholder=" "
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);

                if (error) {
                  setError("");
                }
              }}
              autoComplete="email"
              required
            />

            <label htmlFor="email" className="input-label">
              Enter your email address
            </label>

            <Mail size={18} className="input-icon" aria-hidden="true" />
          </div>

          {error && (
            <div className="invalid-feedback d-block mb-3">{error}</div>
          )}

          <button type="submit" className="get-otp-btn" disabled={submitting}>
            <span className="btn-text">
              {submitting ? "Sending OTP..." : "Get Secure OTP"}
            </span>
          </button>

          <div className="security-badge">
            <ShieldCheck size={17} aria-hidden="true" />

            <span>Your data is protected with end-to-end encryption</span>
          </div>
        </form>
      </div>
    </div>
  );
}
