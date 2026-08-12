"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import InterestSelection from "./InterestSelection";
import TermsSection from "./TermsSection";
import SelectedPass from "./SelectedPass";
import PromoCode from "./PromoCode";
import BadgePreview from "./BadgePreview";
import RegistrationMessageModal from "./RegistrationMessageModal";

import PhoneField from "@/app/components/form/PhoneField/PhoneField";
import InputField from "@/app/components/form/InputField";
import SelectField from "@/app/components/form/SelectField/SelectField";
import VisaApplyModal from "./VisaApplyModal";

const REMINDER_TIME = 30 * 60 * 1000;

const initialFormData = {
  firstName: "",
  lastName: "",
  countryofresidence: "",
  nationality: "",
  email: "",
  confirmemail: "",
  mobile: "",
  phoneCode: "234",
  company: "",
  jobTitle: "",

  interests: [],

  terms: false,
  marketingConsent: false,
  ageConfirm: false,

  promoCode: "",

  visa_required: "",
};

export default function RegistrationForm({ countries = [], selectedTicket }) {
  const router = useRouter();

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [showReminderModal, setShowReminderModal] = useState(false);

  const submittedRef = useRef(false);

  const reminderTimerRef = useRef(null);

  const [visaRequired, setVisaRequired] = useState("");
  const [showVisaModal, setShowVisaModal] = useState(false);

  const [visaForm, setVisaForm] = useState({
    passport_fullname: "",
    visa_dob: {
      dd: "",
      mm: "",
      yyyy: "",
    },
    passport_number: "",
    passport_expiry_date: {
      dd: "",
      mm: "",
      yyyy: "",
    },
    passport_nationality: "",
    passport_country: "",
  });

  const setVisaField = (name, value) => {
    setVisaForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const setVisaDateField = (group, field, value) => {
    setVisaForm((previous) => ({
      ...previous,
      [group]: {
        ...previous[group],
        [field]: value,
      },
    }));
  };

  const HOSTING_COUNTRY = process.env.NEXT_PUBLIC_HOSTING_COUNTRY || "NG";

  const showVisaQuestion =
    formData.countryofresidence &&
    formData.nationality &&
    formData.countryofresidence !== HOSTING_COUNTRY &&
    formData.nationality !== HOSTING_COUNTRY;

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

  const phoneCode =
    formData.phoneCode ||
    selectedCountry?.phoneCode ||
    selectedCountry?.phone_code ||
    "234";

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

  const handleCountryChange = (event) => {
    const { value } = event.target;

    const country = countryOptions.find(
      (item) => String(item.value) === String(value),
    );

    const newPhoneCode = String(
      country?.phoneCode || country?.phone_code || "234",
    ).replace(/^\+/, "");

    setFormData((previous) => ({
      ...previous,

      countryofresidence: value,

      phoneCode: newPhoneCode,
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

    if (!formData.jobTitle.trim()) {
      validationErrors.jobTitle = "Job title is required.";
    }

    if (formData.interests.length < 3) {
      validationErrors.interests = "Please select at least 3 interests.";
    }

    if (!formData.terms) {
      validationErrors.terms = "You must accept this acknowledgement.";
    }

    if (!formData.ageConfirm) {
      validationErrors.ageConfirm = "Age confirmation is required.";
    }

    if (showVisaQuestion && !formData.visa_required) {
      validationErrors.visa_required =
        "Please select whether you require a visa invitation letter.";
    }

    return validationErrors;
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

    const payload = {
      ...formData,

      phoneCode: cleanPhoneCode,

      mobile: cleanMobile,

      mobileFull: `+${cleanPhoneCode}${cleanMobile}`,

      ticketId: selectedTicket?.id ?? null,
    };

    try {
      setSubmitting(true);

      console.log("Registration payload:", payload);

      /*
       * ==================================================
       * REAL API / SERVER ACTION WILL GO HERE
       * ==================================================
       *
       * const result =
       *   await submitRegistrationAction(payload);
       *
       * if (!result?.success) {
       *   throw new Error(
       *     result?.message ||
       *     "Registration failed."
       *   );
       * }
       */

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
      console.error("Registration failed:", error);

      setErrors((previous) => ({
        ...previous,

        submit: error?.message || "Something went wrong. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVisaSubmit = () => {
    console.log("Visa application:", visaForm);

    /*
     * Later:
     *
     * const result = await submitVisaApplicationAction(visaForm);
     */

    setShowVisaModal(false);
  };

  /*
   * ----------------------------------------------------
   * PROMO VALIDATE
   * ----------------------------------------------------
   */

  const handlePromoValidate = () => {
    console.log("Validate promo:", formData.promoCode);
  };

  /*
   * ----------------------------------------------------
   * SUCCESS MODAL CONFIRM
   * ----------------------------------------------------
   */

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);

    router.push("/confirmation");
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
                      error={errors.email}
                      autoComplete="email"
                      onCopy={(event) => event.preventDefault()}
                      required
                    />
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
                      autoComplete="off"
                      onPaste={(event) => event.preventDefault()}
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
                </div>

                {/* ====================================== */}
                {/* INTERESTS */}
                {/* ====================================== */}

                <InterestSelection
                  selected={formData.interests}
                  onChange={(interests) => setField("interests", interests)}
                  error={errors.interests}
                />

                {/* {showVisaQuestion && ( */}
                <div className="mt-2 mb-4 d-flex">
                  <label style={{ marginRight: 10 }}>
                    Do you need a visa invitation letter?
                    <span className="required"> *</span>
                  </label>

                  <br className="visa-break-lg" />

                  <label>
                    <input
                      type="radio"
                      name="visa_required"
                      value="yes"
                      checked={formData.visa_required === "yes"}
                      onChange={() => {
                        setField("visa_required", "yes");
                        setVisaRequired("yes");
                        setShowVisaModal(true);
                      }}
                      style={{ marginRight: 5 }}
                    />
                    Yes
                  </label>

                  <label style={{ marginLeft: 10 }}>
                    <input
                      type="radio"
                      name="visa_required"
                      value="no"
                      checked={formData.visa_required === "no"}
                      onChange={() => {
                        setField("visa_required", "no");
                        setVisaRequired("no");
                        setShowVisaModal(false);
                      }}
                      style={{ marginRight: 5 }}
                    />
                    No
                  </label>

                  {errors.visa_required && (
                    <div
                      className="invalid-feedback"
                      style={{ display: "block" }}
                    >
                      {errors.visa_required}
                    </div>
                  )}
                </div>
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

            <PromoCode
              promoCode={formData.promoCode}
              onChange={handleChange}
              onValidate={handlePromoValidate}
            />

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
