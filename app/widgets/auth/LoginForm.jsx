"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { requestOtpAction } from "@/app/lib/api/visitor";
import { isValidEmail } from "@/app/lib/validation";

const RECAPTCHA_SCRIPT_ID = "login-recaptcha-v3";

function executeRecaptcha(siteKey, action) {
  if (!siteKey || typeof window === "undefined") {
    return Promise.resolve("");
  }

  return new Promise((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn("reCAPTCHA execution timed out, proceeding with OTP request.");
        resolve("");
      }
    }, 2500);

    const safeResolve = (token) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(token || "");
      }
    };

    try {
      if (window.grecaptcha?.execute) {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action })
            .then(safeResolve)
            .catch(() => safeResolve(""));
        });
        return;
      }

      const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = RECAPTCHA_SCRIPT_ID;
        script.src = `https://www.recaptcha.net/recaptcha/api.js?render=${encodeURIComponent(
          siteKey,
        )}`;
        script.async = true;
        script.onload = () => {
          if (window.grecaptcha?.execute) {
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(siteKey, { action })
                .then(safeResolve)
                .catch(() => safeResolve(""));
            });
          } else {
            safeResolve("");
          }
        };
        script.onerror = () => safeResolve("");
        document.head.appendChild(script);
      } else {
        let checks = 0;
        const interval = setInterval(() => {
          checks++;
          if (window.grecaptcha?.execute) {
            clearInterval(interval);
            window.grecaptcha.ready(() => {
              window.grecaptcha
                .execute(siteKey, { action })
                .then(safeResolve)
                .catch(() => safeResolve(""));
            });
          } else if (checks > 15) {
            clearInterval(interval);
            safeResolve("");
          }
        }, 100);
      }
    } catch {
      safeResolve("");
    }
  });
}

export default function LoginForm({ onOtpRequested }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (siteKey && typeof document !== "undefined" && !document.getElementById(RECAPTCHA_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = RECAPTCHA_SCRIPT_ID;
      script.src = `https://www.recaptcha.net/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, [siteKey]);

  const submittingRef = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || submittingRef.current) {
      return;
    }

    submittingRef.current = true;
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required.");
      submittingRef.current = false;
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      submittingRef.current = false;
      return;
    }

    try {
      setSubmitting(true);

      const recaptchaToken = await executeRecaptcha(siteKey, "otp");

      const result = await requestOtpAction(trimmedEmail, recaptchaToken);

      if (!result?.success) {
        throw new Error(result?.message || "Unable to send OTP.");
      }

      onOtpRequested(trimmedEmail);
    } catch (error) {
      setError(error?.message || "Unable to send OTP. Please try again.");
    } finally {
      submittingRef.current = false;
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
