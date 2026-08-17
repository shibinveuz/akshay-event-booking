"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitVisaApplicationAction } from "@/app/lib/api/visa";
import VisaApplyModal from "./VisaApplyModal";
import { isVisaFormComplete, useVisaForm } from "./useVisaForm";

export default function VisaApplicationModal({
  show,
  onHide,
  countries = [],
  registrationId = "",
  initialValues = {},
  accessContext = "visitor",
}) {
  const router = useRouter();
  const { visaForm, setVisaField, setVisaDateField } =
    useVisaForm(initialValues);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (isLoading) return;
    setError("");
    setMessage("");

    if (!isVisaFormComplete(visaForm)) {
      setError("Complete all visa invitation letter fields.");
      return;
    }

    setIsLoading(true);
    const result = await submitVisaApplicationAction({
      accessContext,
      registrationId,
      visaForm,
    });
    setIsLoading(false);

    if (!result?.success) {
      setError(result?.message || "Unable to submit the visa application.");
      return;
    }

    setMessage("");
    onHide();
    router.refresh();
  };

  return (
    <VisaApplyModal
      show={show}
      onHide={onHide}
      visaForm={visaForm}
      setVisaField={setVisaField}
      setVisaDateField={setVisaDateField}
      countries={countries}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
      message={message}
    />
  );
}
