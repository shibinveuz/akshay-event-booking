"use client";

import { useState } from "react";
import LoginForm from "./LoginForm";
import OtpForm from "./OtpForm";

export default function Login() {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");

  const handleOtpRequested = (userEmail) => {
    setEmail(userEmail);
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
              <OtpForm email={email} onBack={() => setStep("login")} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
