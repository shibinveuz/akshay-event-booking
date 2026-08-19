"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { verifyOtpAction, requestOtpAction } from "@/app/lib/api/visitor";
import { useAuthState } from "@/app/context/AuthStateContext";

const OTP_LENGTH = 4;
const OTP_EXPIRY_SECONDS = 5 * 60;
const RECAPTCHA_SCRIPT_ID = "login-recaptcha-v3";

function executeRecaptcha(siteKey, action) {
  if (!siteKey || typeof window === "undefined") {
    return Promise.resolve("");
  }

  return new Promise((resolve) => {
    let settled = false;
    const timeout = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve("");
      }
    }, 3000);
    const finish = (token = "") => {
      if (!settled) {
        settled = true;
        window.clearTimeout(timeout);
        resolve(token);
      }
    };

    if (window.grecaptcha?.execute) {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action })
          .then(finish)
          .catch(() => finish());
      });
      return;
    }
    finish();
  });
}

export default function OtpForm({ email, initialOtpToken, onBack }) {
  const router = useRouter();
  const { setAuthenticated } = useAuthState();

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));

  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpToken, setOtpToken] = useState(initialOtpToken);

  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);

  const inputRefs = useRef([]);
  const verificationInFlightRef = useRef(false);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [secondsLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedOtp = [...otp];
    updatedOtp[index] = digit;

    setOtp(updatedOtp);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updatedOtp.every(Boolean)) {
      void handleVerify(updatedOtp.join(""));
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleVerify();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) {
      return;
    }

    const updatedOtp = Array(OTP_LENGTH).fill("");

    pasted.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);
    setError("");

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);

    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === OTP_LENGTH) {
      void handleVerify(pasted);
    }
  };

  const handleVerify = async (codeOverride) => {
    const code = typeof codeOverride === "string" ? codeOverride : otp.join("");

    if (code.length !== OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits of the OTP.`);
      return;
    }

    if (verificationInFlightRef.current) {
      return;
    }

    try {
      verificationInFlightRef.current = true;
      setVerifying(true);
      setError("");

      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      const recaptchaToken = await executeRecaptcha(siteKey, "login");
      const result = await verifyOtpAction(otpToken, code, recaptchaToken);

      if (!result?.success) {
        throw new Error(result?.message || "Invalid OTP code.");
      }

      setAuthenticated(true);
      router.replace("/visitor-portal");
    } catch (error) {
      setError(error?.message || "OTP verification failed. Please try again.");
    } finally {
      verificationInFlightRef.current = false;
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resending) {
      return;
    }

    try {
      setResending(true);
      setError("");

      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      const recaptchaToken = await executeRecaptcha(siteKey, "regenerateotp");

      const result = await requestOtpAction(email, recaptchaToken);

      if (!result?.success) {
        throw new Error(result?.message || "Unable to resend OTP.");
      }

      setOtpToken(result.otpToken);
      setOtp(Array(OTP_LENGTH).fill(""));
      setSecondsLeft(OTP_EXPIRY_SECONDS);

      window.setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    } catch (error) {
      setError(error?.message || "Unable to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <h4>OTP Verification</h4>

      <div className="sub-wrapper-cntnt">
        <p>
          Enter the OTP sent to <span>{email}</span>
        </p>

        <form
          className="otp-inputs-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleVerify();
          }}
        >
          <div className="otp-inputs otp-input">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                id={`otp-${index + 1}`}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={index === 0 ? handlePaste : undefined}
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>

          {error && (
            <p className="text-danger mt-2" role="alert">
              {error}
            </p>
          )}
        </form>

        <h6 className="resend-otp">
          Didn&apos;t you receive the OTP?
          <br />
          {secondsLeft > 0 ? (
            <span>
              Time remaining: <span>{formatTime(secondsLeft)}</span>
            </span>
          ) : (
            <button
              type="button"
              className="btn btn-link p-0"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </h6>

        <button
          type="button"
          className="secondary-btn"
          onClick={handleVerify}
          disabled={verifying}
        >
          {verifying ? "Verifying..." : "Verify"}
        </button>

        {/* <button
          type="button"
          className="btn btn-link d-block mx-auto mt-3"
          onClick={onBack}
        >
          Change Email Address
        </button> */}
      </div>
    </>
  );
}
