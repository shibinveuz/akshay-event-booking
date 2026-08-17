"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

import InterestSelection, {
  getRequiredInterestCount,
} from "./InterestSelection";
import TermsSection from "./TermsSection";
import SelectedPass from "./SelectedPass";
import PromoCode from "./PromoCode";
import BadgePreview from "./BadgePreview";
import RegistrationMessageModal from "./RegistrationMessageModal";
import FileUploadCropper from "@/app/components/common/FileUploadCropper";

import {
  submitRegistrationAction,
  checkEmailAction,
  validatePromoCodeAction,
} from "@/app/lib/api/registration";
import PhoneField from "@/app/components/form/PhoneField/PhoneField";
import InputField from "@/app/components/form/InputField";
import SelectField from "@/app/components/form/SelectField/SelectField";
import VisaApplyModal from "./VisaApplyModal";
import VisaQuestion from "./VisaQuestion";
import { isVisaFormComplete, useVisaForm } from "./useVisaForm";
import {
  COMPANY_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
} from "./profileOptions";

const REMINDER_TIME = 30 * 60 * 1000;
const RECAPTCHA_SCRIPT_ID = "registration-recaptcha-v3";
function getDialCode(country) {
  return String(
    country?.phoneCode ||
      country?.phone_code ||
      country?.dialCode ||
      country?.dial_code ||
      country?.callingCode ||
      country?.calling_code ||
      "",
  ).replace(/^\+/, "");
}

function getConfirmationId(result) {
  const candidates = [result?.confirmationId];

  return candidates.find(
    (candidate) => typeof candidate === "string" && candidate.trim(),
  );
}

function executeRecaptcha(siteKey) {
  if (!siteKey) {
    return Promise.reject(
      new Error("Registration security verification is not configured."),
    );
  }

  const run = () =>
    new Promise((resolve, reject) => {
      window.grecaptcha.ready(() => {
        window.grecaptcha
          .execute(siteKey, { action: "registration" })
          .then(resolve, reject);
      });
    });

  if (window.grecaptcha?.execute) {
    return run();
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(RECAPTCHA_SCRIPT_ID);
    const script = existingScript || document.createElement("script");
    const handleLoad = () => run().then(resolve, reject);

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Security verification could not be loaded.")),
      { once: true },
    );

    if (!existingScript) {
      script.id = RECAPTCHA_SCRIPT_ID;
      script.src = `https://www.recaptcha.net/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
}

const initialFormData = {
  firstName: "",
  lastName: "",
  countryofresidence: "",
  nationality: "",
  email: "",
  confirmemail: "",
  mobile: "",
  phoneCode: "234",
  phoneCountry: "NG",
  company: "",
  companyType: "",
  industry: "",
  jobTitle: "",

  interests: [],

  terms: false,
  marketingConsent: false,
  ageConfirm: false,

  promoCode: "",

  visa_required: "",

  registrationId: "", // Store registration ID for abandoned flow
};

export default function RegistrationForm({
  countries = [],
  selectedTicket,
  interestOptions = [],
}) {
  const router = useRouter();

  const [formData, setFormData] = useState(initialFormData);
  const [documentFile, setDocumentFile] = useState(null);
  const [pendingDocumentFile, setPendingDocumentFile] = useState(null);
  const [pendingDocumentUrl, setPendingDocumentUrl] = useState("");
  const [showDocumentCropper, setShowDocumentCropper] = useState(false);

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [couponData, setCouponData] = useState({});
  const [promoState, setPromoState] = useState({
    loading: false,
    message: "",
    success: false,
  });

  // Email Validation State
  const [emailStatus, setEmailStatus] = useState("idle"); // idle, validating, error, success
  const [emailErrorMessage, setEmailErrorMessage] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [confirmationId, setConfirmationId] = useState("");

  const [confirmationToken, setConfirmationToken] = useState("");

  const [showReminderModal, setShowReminderModal] = useState(false);

  const submittedRef = useRef(false);

  const reminderTimerRef = useRef(null);
  const documentInputRef = useRef(null);
  const pendingDocumentUrlRef = useRef("");

  const [showVisaModal, setShowVisaModal] = useState(false);

  const { visaForm, setVisaField, setVisaDateField } = useVisaForm();

  useEffect(() => {
    return () => {
      if (pendingDocumentUrlRef.current) {
        URL.revokeObjectURL(pendingDocumentUrlRef.current);
      }
    };
  }, []);

  const HOSTING_COUNTRY = process.env.NEXT_PUBLIC_HOSTING_COUNTRY || "NG";

  // const showVisaQuestion =
  //   formData.countryofresidence &&
  //   formData.nationality &&
  //   formData.countryofresidence !== HOSTING_COUNTRY &&
  //   formData.nationality !== HOSTING_COUNTRY;

  /*
   * ----------------------------------------------------
   * COUNTRY OPTIONS
   * ----------------------------------------------------
   */

  const countryOptions = useMemo(() => {
    return countries.map((country) => ({
      ...country,

      label: country.label || country.name || country.country_name || "",

      value:
        country.value ||
        country.code ||
        country.country_code ||
        country.id ||
        "",
    }));
  }, [countries]);

  /*
   * ----------------------------------------------------
   * SELECTED COUNTRY
   * ----------------------------------------------------
   */

  const selectedCountry = useMemo(() => {
    return countryOptions.find(
      (country) =>
        String(country.value) === String(formData.countryofresidence),
    );
  }, [countryOptions, formData.countryofresidence]);

  /*
   * ----------------------------------------------------
   * PHONE CODE
   * ----------------------------------------------------
   */

  const phoneCode = formData.phoneCode || getDialCode(selectedCountry) || "234";

  /*
   * ----------------------------------------------------
   * GENERIC SET FIELD
   * ----------------------------------------------------
   */

  const setField = (name, value) => {
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  /*
   * ----------------------------------------------------
   * NORMAL INPUT CHANGE
   * ----------------------------------------------------
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setField(name, value);

    if (name === "promoCode") {
      setCouponData({});
      setPromoState({ loading: false, message: "", success: false });
    }

    // Reset email validation status if user types a new email
    if (name === "email" && emailStatus !== "idle") {
      setEmailStatus("idle");
      setEmailErrorMessage("");
    }
  };

  /*
   * ----------------------------------------------------
   * CHECKBOX CHANGE
   * ----------------------------------------------------
   */

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setField(name, checked);
  };

  /*
   * ----------------------------------------------------
   * COUNTRY CHANGE
   * ----------------------------------------------------
   */

  const handleCountryChange = (event, selectedOption) => {
    const { value } = event.target;

    const country =
      selectedOption ||
      countryOptions.find((item) => String(item.value) === String(value));

    const newPhoneCode = getDialCode(country);

    setFormData((previous) => ({
      ...previous,

      countryofresidence: value,

      phoneCode: newPhoneCode || previous.phoneCode,

      phoneCountry: value,
    }));

    setErrors((previous) => ({
      ...previous,

      countryofresidence: "",
      phoneCode: "",
    }));
  };

  /*
   * ----------------------------------------------------
   * VALIDATION
   * ----------------------------------------------------
   */

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.firstName.trim()) {
      validationErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      validationErrors.lastName = "Last name is required.";
    }

    if (!formData.countryofresidence) {
      validationErrors.countryofresidence = "Country of residence is required.";
    }

    if (!formData.nationality) {
      validationErrors.nationality = "Nationality is required.";
    }

    if (!formData.email.trim()) {
      validationErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      validationErrors.email = "Please enter a valid email address.";
    } else if (emailStatus === "error") {
      validationErrors.email = emailErrorMessage;
    } else if (emailStatus === "validating") {
      validationErrors.email = "Please wait while we validate your email.";
    }

    if (!formData.confirmemail.trim()) {
      validationErrors.confirmemail = "Please confirm your email address.";
    } else if (
      formData.email.trim().toLowerCase() !==
      formData.confirmemail.trim().toLowerCase()
    ) {
      validationErrors.confirmemail = "Email addresses do not match.";
    }

    if (!formData.mobile.trim()) {
      validationErrors.mobile = "Mobile number is required.";
    }

    if (!formData.company.trim()) {
      validationErrors.company = "Company name is required.";
    }

    if (!formData.companyType) {
      validationErrors.companyType = "Company type is required.";
    }

    if (!formData.industry) {
      validationErrors.industry = "Industry is required.";
    }

    if (!formData.jobTitle.trim()) {
      validationErrors.jobTitle = "Job title is required.";
    }

    const requiredInterestCount = getRequiredInterestCount(interestOptions);
    if (formData.interests.length < requiredInterestCount) {
      validationErrors.interests = `Please select at least ${requiredInterestCount} interest${requiredInterestCount === 1 ? "" : "s"}.`;
    }

    if (selectedTicket?.documentRequired && !documentFile) {
      validationErrors.userDocument =
        "A supporting document is required for this pass.";
    }

    if (!formData.terms) {
      validationErrors.terms = "You must accept this acknowledgement.";
    }

    if (!formData.ageConfirm) {
      validationErrors.ageConfirm = "Age confirmation is required.";
    }

    // if (showVisaQuestion && !formData.visa_required) {
    //   validationErrors.visa_required =
    //     "Please select whether you require a visa invitation letter.";
    // }

    if (formData.visa_required === "yes") {
      if (!isVisaFormComplete(visaForm)) {
        validationErrors.visa_required =
          "Complete your visa invitation letter details.";
      }
    }

    return validationErrors;
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        userDocument: "Please upload a JPEG or PNG image.",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((previous) => ({
        ...previous,
        userDocument: "The supporting document must be 5 MB or smaller.",
      }));
      return;
    }

    setPendingDocumentForCrop(file);
    setShowDocumentCropper(true);
    setErrors((previous) => ({ ...previous, userDocument: "" }));
  };

  const setPendingDocumentForCrop = (file) => {
    if (pendingDocumentUrlRef.current) {
      URL.revokeObjectURL(pendingDocumentUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    pendingDocumentUrlRef.current = objectUrl;
    setPendingDocumentFile(file);
    setPendingDocumentUrl(objectUrl);
  };

  const clearPendingDocument = () => {
    if (pendingDocumentUrlRef.current) {
      URL.revokeObjectURL(pendingDocumentUrlRef.current);
      pendingDocumentUrlRef.current = "";
    }

    setPendingDocumentFile(null);
    setPendingDocumentUrl("");
  };

  const handleDocumentCropDone = (croppedFile) => {
    setDocumentFile(croppedFile);
    clearPendingDocument();
    setShowDocumentCropper(false);
    setErrors((previous) => ({ ...previous, userDocument: "" }));
  };

  const handleDocumentCropCancel = () => {
    clearPendingDocument();
    setShowDocumentCropper(false);
  };

  const handleDocumentRemove = () => {
    setDocumentFile(null);
    clearPendingDocument();
    setErrors((previous) => ({
      ...previous,
      userDocument: selectedTicket?.documentRequired
        ? "A supporting document is required for this pass."
        : "",
    }));
  };

  /*
   * ----------------------------------------------------
   * EMAIL VALIDATION ON BLUR
   * ----------------------------------------------------
   */

  const handleEmailBlur = async () => {
    const email = formData.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return; // Wait for a valid format before checking
    }

    setEmailStatus("validating");
    setEmailErrorMessage("");

    try {
      const result = await checkEmailAction(email, selectedTicket?.id);

      if (!result.success && result.error) {
        // Silently fail if API is not available to avoid blocking development
        console.warn(
          "Email validation check failed (endpoint might not exist).",
        );
        setEmailStatus("idle");
        return;
      }

      if (result.isCompleted) {
        setEmailStatus("error");
        setEmailErrorMessage(
          result.message ||
            "This email address is already registered. Please use a different email address or log in to your existing account.",
        );
      } else if (result.isAbandoned) {
        setEmailStatus("success");
        // Automatically populate available fields
        const abandonedData = result.data || {};

        setFormData((prev) => ({
          ...prev,
          firstName: abandonedData.firstName || prev.firstName,
          lastName: abandonedData.lastName || prev.lastName,
          registrationId: abandonedData.registrationId || "",
          // Add more fields here if provided safely by the backend
        }));
      } else {
        setEmailStatus("success");
      }
    } catch (error) {
      console.error("Email validation error:", error);
      setEmailStatus("idle"); // reset on error so they aren't blocked
    }
  };

  /*
   * ----------------------------------------------------
   * SUBMIT
   * ----------------------------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setErrors({});

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const firstErrorField = Object.keys(validationErrors)[0];

      window.setTimeout(() => {
        document.getElementById(firstErrorField)?.focus();
      }, 0);

      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, "");

    const cleanPhoneCode = String(phoneCode).replace(/^\+/, "");

    const country = countryOptions.find(
      (item) => String(item.value) === String(formData.countryofresidence),
    );
    const nationality = countryOptions.find(
      (item) => String(item.value) === String(formData.nationality),
    );

    const payload = {
      ...formData,

      phoneCode: cleanPhoneCode,

      mobile: cleanMobile,

      mobileFull: `+${cleanPhoneCode}${cleanMobile}`,

      ticketId: selectedTicket?.id ?? null,

      ticketEncryptedId: selectedTicket?.encryptedId || "",

      badgeCategory: selectedTicket?.category || "VISITOR",

      documentRequired: Boolean(selectedTicket?.documentRequired),

      currency: selectedTicket?.currency || "NGN",

      countryName: country?.label || formData.countryofresidence,

      nationalityName: nationality?.label || formData.nationality,

      visaForm,

      registrationId: formData.registrationId || undefined,

      couponData,
    };

    try {
      setSubmitting(true);

      const recaptchaToken = await executeRecaptcha(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      );

      const submission = new FormData();
      submission.append(
        "payload",
        JSON.stringify({ ...payload, recaptchaToken }),
      );
      if (documentFile) {
        submission.append("userDocument", documentFile);
      }

      const result = await submitRegistrationAction(submission);

      if (!result?.success) {
        setErrors((previous) => ({
          ...previous,
          submit: result?.message || "Registration failed.",
        }));
        return;
      }

      const nextConfirmationId = getConfirmationId(result);

      if (!nextConfirmationId) {
        setErrors((previous) => ({
          ...previous,
          submit:
            "Registration succeeded, but the confirmation reference was not returned.",
        }));
        return;
      }

      setConfirmationId(nextConfirmationId);
      setConfirmationToken(result.confirmationToken || "");

      /*
       * Registration success
       */
      submittedRef.current = true;

      /*
       * Clear reminder timer
       */
      if (reminderTimerRef.current) {
        window.clearTimeout(reminderTimerRef.current);

        reminderTimerRef.current = null;
      }

      /*
       * Close reminder if it is open
       */
      setShowReminderModal(false);

      /*
       * Show success modal
       */
      setShowSuccessModal(true);
    } catch (error) {
      setErrors((previous) => ({
        ...previous,

        submit: error?.message || "Something went wrong. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisaSubmit = () => {
    if (!isVisaFormComplete(visaForm)) {
      setErrors((previous) => ({
        ...previous,
        visa_required: "Complete all visa invitation letter fields.",
      }));
      return;
    }

    setErrors((previous) => ({ ...previous, visa_required: "" }));
    setShowVisaModal(false);
  };

  /*
   * ----------------------------------------------------
   * PROMO VALIDATE
   * ----------------------------------------------------
   */

  const handlePromoValidate = async () => {
    if (promoState.loading) return;

    setPromoState({ loading: true, message: "", success: false });
    const result = await validatePromoCodeAction({
      couponCode: formData.promoCode,
      email: formData.email,
      ticketId: selectedTicket?.id,
      price: selectedTicket?.priceAmount,
      currency: selectedTicket?.currency,
    });

    if (result?.success) {
      setCouponData(result.couponData || {});
      setPromoState({
        loading: false,
        message: result.message || "Promo code applied.",
        success: true,
      });
      return;
    }

    setCouponData({});
    setPromoState({
      loading: false,
      message: result?.message || "Invalid promo code.",
      success: false,
    });
  };

  /*
   * ----------------------------------------------------
   * SUCCESS MODAL CONFIRM
   * ----------------------------------------------------
   */

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);

    const params = new URLSearchParams({ id: confirmationId });

    if (confirmationToken) {
      params.set("token", confirmationToken);
    }

    router.push(`/confirmation?${params.toString()}`);
  };

  /*
   * ----------------------------------------------------
   * REMINDER MODAL CONFIRM
   * ----------------------------------------------------
   */

  const handleReminderConfirm = () => {
    setShowReminderModal(false);

    window.setTimeout(() => {
      document.querySelector("#registrationForm")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  /*
   * ----------------------------------------------------
   * 30 MINUTE REMINDER
   * ----------------------------------------------------
   */

  useEffect(() => {
    reminderTimerRef.current = window.setTimeout(() => {
      if (!submittedRef.current) {
        setShowReminderModal(true);
      }
    }, REMINDER_TIME);

    return () => {
      if (reminderTimerRef.current) {
        window.clearTimeout(reminderTimerRef.current);
      }
    };
  }, []);

  /*
   * ----------------------------------------------------
   * RENDER
   * ----------------------------------------------------
   */

  return (
    <>
      <div className="main-badge-wrapper">
        {/* ====================================== */}
        {/* LEFT - REGISTRATION FORM */}
        {/* ====================================== */}

        <div className="main-badge-wrapper-right">
          <div className="card form-card">
            <div className="card-header">
              <h3>Please fill out the registration form below</h3>
            </div>

            <div className="card-body p-4">
              <form id="registrationForm" noValidate onSubmit={handleSubmit}>
                <div className="row">
                  {/* FIRST NAME */}

                  <div className="col-12 col-sm-6">
                    <InputField
                      id="firstName"
                      name="firstName"
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  {/* LAST NAME */}

                  <div className="col-12 col-sm-6">
                    <InputField
                      id="lastName"
                      name="lastName"
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      autoComplete="family-name"
                      required
                    />
                  </div>

                  {/* COUNTRY OF RESIDENCE */}

                  <div className="col-12 col-sm-6">
                    <SelectField
                      id="countryofresidence"
                      name="countryofresidence"
                      label="Country of Residence"
                      value={formData.countryofresidence}
                      options={countryOptions}
                      onChange={handleCountryChange}
                      error={errors.countryofresidence}
                      required
                    />
                  </div>

                  {/* NATIONALITY */}

                  <div className="col-12 col-sm-6">
                    <SelectField
                      id="nationality"
                      name="nationality"
                      label="Nationality"
                      value={formData.nationality}
                      options={countryOptions}
                      onChange={handleChange}
                      error={errors.nationality}
                      required
                    />
                  </div>

                  {/* EMAIL */}

                  <div className="col-12 col-sm-6">
                    <InputField
                      id="email"
                      name="email"
                      type="email"
                      label="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleEmailBlur}
                      error={
                        errors.email ||
                        (emailStatus === "error" ? emailErrorMessage : "")
                      }
                      autoComplete="email"
                      required
                    />
                    {emailStatus === "validating" && (
                      <small className="text-muted d-block mt-1">
                        Validating email...
                      </small>
                    )}
                  </div>

                  {/* CONFIRM EMAIL */}

                  <div className="col-12 col-sm-6">
                    <InputField
                      id="confirmemail"
                      name="confirmemail"
                      type="email"
                      label="Confirm Email Address"
                      value={formData.confirmemail}
                      onChange={handleChange}
                      error={errors.confirmemail}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* PHONE */}

                  <div className="col-md-6">
                    <PhoneField
                      fields={formData}
                      setField={setField}
                      error={errors.mobile}
                      countriesList={countries}
                    />
                  </div>

                  {/* JOB TITLE */}

                  <div className="col-md-6">
                    <InputField
                      id="jobTitle"
                      name="jobTitle"
                      label="Job Title"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      error={errors.jobTitle}
                      autoComplete="organization-title"
                      required
                    />
                  </div>

                  {/* COMPANY */}

                  <div className="col-lg-6">
                    <InputField
                      id="company"
                      name="company"
                      label="Company Name"
                      value={formData.company}
                      onChange={handleChange}
                      error={errors.company}
                      autoComplete="organization"
                      required
                    />
                  </div>

                  {/* COMPANY TYPE */}

                  <div className="col-md-6">
                    <SelectField
                      id="companyType"
                      name="companyType"
                      label="Company Type"
                      value={formData.companyType}
                      options={COMPANY_TYPE_OPTIONS}
                      onChange={handleChange}
                      error={errors.companyType}
                      isRequired
                    />
                  </div>

                  {/* INDUSTRY */}

                  <div className="col-md-6">
                    <SelectField
                      id="industry"
                      name="industry"
                      label="Which industry do you belong to?"
                      value={formData.industry}
                      options={INDUSTRY_OPTIONS}
                      labelKey="name"
                      valueKey="code"
                      onChange={handleChange}
                      error={errors.industry}
                      isRequired
                    />
                  </div>
                </div>

                {/* ====================================== */}
                {/* INTERESTS */}
                {/* ====================================== */}

                {interestOptions.length > 0 && (
                  <InterestSelection
                    options={interestOptions}
                    selected={formData.interests}
                    onChange={(interests) => setField("interests", interests)}
                    error={errors.interests}
                  />
                )}

                {selectedTicket?.documentRequired && (
                  <div className="mt-4 mb-4 col-12 col-sm-6">
                    <label className="form-label" htmlFor="userDocument">
                      Identification Document &ndash; {selectedTicket.name} Card{" "}
                      <span className="required">*</span>
                    </label>
                    {documentFile ? (
                      <div className="registration-upload-preview">
                        <Upload aria-hidden="true" size={28} />
                        <div>
                          <strong>{documentFile.name}</strong>
                          <span>
                            {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            onClick={() => documentInputRef.current?.click()}
                          >
                            Change image
                          </button>
                        </div>
                        <button
                          type="button"
                          className="registration-upload-remove"
                          title="Remove document"
                          aria-label="Remove document"
                          onClick={handleDocumentRemove}
                        >
                          <X aria-hidden="true" size={18} />
                        </button>
                      </div>
                    ) : (
                      <label
                        className="registration-upload-box"
                        htmlFor="userDocument"
                      >
                        <Upload aria-hidden="true" size={32} />
                        <strong>Click to Upload ID</strong>
                        <span>Allowed jpg, png. Max size: 5MB</span>
                      </label>
                    )}
                    <input
                      ref={documentInputRef}
                      id="userDocument"
                      name="userDocument"
                      type="file"
                      accept="image/jpeg,image/png"
                      className="visually-hidden"
                      onChange={handleDocumentChange}
                    />
                    {errors.userDocument && (
                      <div className="invalid-feedback d-block">
                        {errors.userDocument}
                      </div>
                    )}
                  </div>
                )}

                {/* {showVisaQuestion && ( */}
                <VisaQuestion
                  value={formData.visa_required}
                  error={errors.visa_required}
                  onChange={(value) => {
                    setField("visa_required", value);
                    setShowVisaModal(value === "yes");
                  }}
                />
                {/* )} */}

                {/* ====================================== */}
                {/* TERMS */}
                {/* ====================================== */}

                <TermsSection
                  formData={formData}
                  errors={errors}
                  onCheckboxChange={handleCheckboxChange}
                />

                {/* ====================================== */}
                {/* API ERROR */}
                {/* ====================================== */}

                {errors.submit && (
                  <div className="alert alert-danger mt-3" role="alert">
                    {errors.submit}
                  </div>
                )}

                {/* ====================================== */}
                {/* SUBMIT BUTTON */}
                {/* ====================================== */}

                <div className="footer-btn">
                  <button
                    type="submit"
                    className="btn btn-primary2"
                    disabled={submitting || showSuccessModal}
                  >
                    {submitting ? "Submitting..." : "Complete Registration"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ====================================== */}
        {/* RIGHT SIDE */}
        {/* ====================================== */}

        <div className="main-badge-wrapper-left">
          <div className={`form-right-col ${selectedTicket?.className || ""}`}>
            <SelectedPass ticket={selectedTicket} />

            {Number(selectedTicket?.priceAmount || 0) > 0 && (
              <PromoCode
                promoCode={formData.promoCode}
                onChange={handleChange}
                onValidate={handlePromoValidate}
                loading={promoState.loading}
                message={promoState.message}
                success={promoState.success}
              />
            )}

            <BadgePreview formData={formData} selectedTicket={selectedTicket} />
          </div>
        </div>
      </div>

      {/* ====================================== */}
      {/* 30 MINUTE REMINDER MODAL */}
      {/* ====================================== */}

      <RegistrationMessageModal
        show={showReminderModal}
        type="reminder"
        onHide={() => setShowReminderModal(false)}
        onConfirm={handleReminderConfirm}
      />

      {/* ====================================== */}
      {/* SUCCESS MODAL */}
      {/* ====================================== */}

      <RegistrationMessageModal
        show={showSuccessModal}
        type="success"
        onHide={() => setShowSuccessModal(false)}
        onConfirm={handleSuccessConfirm}
      />

      {showDocumentCropper && pendingDocumentFile && (
        <FileUploadCropper
          key={pendingDocumentUrl}
          show
          sourceFile={pendingDocumentFile}
          sourceUrl={pendingDocumentUrl}
          cropType="freesize"
          onCropDone={handleDocumentCropDone}
          onCancel={handleDocumentCropCancel}
        />
      )}
      {/* ====================================== */}

      <VisaApplyModal
        show={showVisaModal}
        onHide={() => setShowVisaModal(false)}
        visaForm={visaForm}
        setVisaField={setVisaField}
        setVisaDateField={setVisaDateField}
        countries={countries}
        onSubmit={handleVisaSubmit}
        isLoading={false}
      />
    </>
  );
}
