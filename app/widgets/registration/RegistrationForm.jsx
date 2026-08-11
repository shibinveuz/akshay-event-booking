"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import InterestSelection from "./InterestSelection";
import TermsSection from "./TermsSection";
import SelectedPass from "./SelectedPass";
import PromoCode from "./PromoCode";
import BadgePreview from "./BadgePreview";
import PhoneField from "@/app/components/form/PhoneField/PhoneField";
import InputField from "@/app/components/form/InputField";
import SelectField from "@/app/components/form/SelectField";

const initialFormData = {
  firstName: "",
  lastName: "",
  countryofresidence: "",
  nationality: "",
  email: "",
  confirmemail: "",
  mobile: "",
  phoneCode: "",
  company: "",
  jobTitle: "",

  interests: [],

  terms: false,
  marketingConsent: false,
  ageConfirm: false,

  promoCode: "",
};

export default function RegistrationForm({ countries = [], selectedTicket }) {
  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});

  const router = useRouter();

  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedCountry = useMemo(
    () =>
      countries.find(
        (country) => country.value === formData.countryofresidence,
      ),
    [countries, formData.countryofresidence],
  );

  const phoneCode = formData.phoneCode || selectedCountry?.phoneCode || "234";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: checked,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

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
    }

    if (formData.email !== formData.confirmemail) {
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

    return validationErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...formData,

      mobileFull: `${phoneCode}${formData.mobile}`,

      ticketId: selectedTicket?.id,
    };

    console.log("Registration payload:", payload);

    try {
      setSubmitting(true);

      /*
       * ==========================================
       * REAL API INTEGRATION WILL GO HERE LATER
       * ==========================================
       *
       * Example:
       *
       * const result = await submitRegistration(payload);
       *
       * if (!result?.success) {
       *   throw new Error(
       *     result?.message || "Registration failed"
       *   );
       * }
       */

      // Temporary success behavior
      setShowSuccess(true);

      // Redirect after showing popup
      setTimeout(() => {
        router.push("/confirmation");
      }, 2000);
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

  const handlePromoValidate = () => {
    console.log("Validate promo:", formData.promoCode);
  };

  return (
    <>
      <div className="main-badge-wrapper">
        {/* LEFT FORM */}

        <div className="main-badge-wrapper-right">
          <div className="card form-card">
            <div className="card-header">
              <h3>Please fill out the registration form below</h3>
            </div>

            <div className="card-body p-4">
              <form noValidate onSubmit={handleSubmit}>
                <div className="row">
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

                  <div className="col-12 col-sm-6">
                    <SelectField
                      id="countryofresidence"
                      name="countryofresidence"
                      label="Country of Residence"
                      value={formData.countryofresidence}
                      onChange={handleChange}
                      options={countries}
                      error={errors.countryofresidence}
                      required
                    />
                  </div>

                  <div className="col-12 col-sm-6">
                    <SelectField
                      id="nationality"
                      name="nationality"
                      label="Nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      options={countries}
                      error={errors.nationality}
                      required
                    />
                  </div>

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
                      required
                    />
                  </div>

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
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <PhoneField
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      phoneCode={phoneCode}
                      onChange={handleChange}
                      error={errors.mobile}
                      required
                    />
                  </div>

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

                <InterestSelection
                  selected={formData.interests}
                  onChange={(interests) => {
                    setFormData((previous) => ({
                      ...previous,
                      interests,
                    }));

                    setErrors((previous) => ({
                      ...previous,
                      interests: "",
                    }));
                  }}
                  error={errors.interests}
                />

                <TermsSection
                  formData={formData}
                  errors={errors}
                  onCheckboxChange={handleCheckboxChange}
                />

                <div className="footer-btn">
                  <button type="submit" className="btn btn-primary2">
                    Complete Registration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}

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
      {showSuccess && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body text-center p-5">
                <div className="mb-3">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "70px",
                      height: "70px",
                      fontSize: "32px",
                    }}
                  >
                    ✓
                  </span>
                </div>

                <h3>Registration Submitted!</h3>

                <p className="mb-0">
                  Your registration has been successfully completed.
                </p>

                <p className="text-muted mt-2">
                  Redirecting to confirmation page...
                </p>
              </div>
            </div>
          </div>

          <div className="modal-backdrop fade show" />
        </div>
      )}
    </>
  );
}
