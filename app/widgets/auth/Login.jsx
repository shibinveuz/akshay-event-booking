"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import OtpForm from "./OtpForm";

export default function Login() {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");

  const handleOtpRequested = (userEmail, token) => {
    setEmail(userEmail);
    setOtpToken(token);
    setStep("otp");
  };

  return (
    <div className="login-wrapper">
      <section className="content min-height-70">
        <div className="custom-container">
          <div className="sub-wrapper">
            {step === "login" ? (
              <LoginForm onOtpRequested={handleOtpRequested} />
            ) : (
              <OtpForm
                email={email}
                initialOtpToken={otpToken}
                onBack={() => setStep("login")}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
