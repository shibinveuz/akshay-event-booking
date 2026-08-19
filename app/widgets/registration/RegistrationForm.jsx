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
import { useCurrency } from "@/app/context/CurrencyContext";

import {
  submitRegistrationAction,
  validatePromoCodeAction,
} from "@/app/lib/api/registration";
import PhoneField from "@/app/components/form/PhoneField/PhoneField";
import InputField from "@/app/components/form/InputField";
import SelectField from "@/app/components/form/SelectField/SelectField";
import VisaApplyModal from "./VisaApplyModal";
import VisaQuestion from "./VisaQuestion";
import { isVisaFormComplete, useVisaForm } from "./useVisaForm";
import { COMPANY_TYPE_OPTIONS, INDUSTRY_OPTIONS } from "./profileOptions";
import {
  isValidEmail,
  validatePhoneNumber,
  validateName,
  validateTextField,
  validateJobTitle,
  validateCompanyName,
  validateVisaForm,
} from "@/app/lib/validation";

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
  const { currency } = useCurrency();

  const [formData, setFormData] = useState(initialFormData);
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState("");
  const [pendingDocumentFile, setPendingDocumentFile] = useState(null);
  const [pendingDocumentUrl, setPendingDocumentUrl] = useState("");
  const [showDocumentCropper, setShowDocumentCropper] = useState(false);

  useEffect(() => {
    if (!documentFile) {
      setDocumentPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(documentFile);
    setDocumentPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [documentFile]);

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const promoLoadingRef = useRef(false);
  const [couponData, setCouponData] = useState({});
  const [promoState, setPromoState] = useState({
    loading: false,
    message: "",
    success: false,
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    setFormData((previous) => {
      const nextFormData = {
        ...previous,
        [name]: value,
      };

      if (touched[name] || errors[name] || (name === "mobile" && value)) {
        const errorMsg = validateSingleField(name, value, nextFormData);
        setErrors((prev) => ({
          ...prev,
          [name]: errorMsg,
        }));
      }

      if (name === "phoneCode" || name === "phoneCountry") {
        if (touched.mobile || errors.mobile || previous.mobile) {
          const mobileErr = validateSingleField(
            "mobile",
            previous.mobile,
            nextFormData,
          );
          setErrors((prev) => ({
            ...prev,
            mobile: mobileErr,
          }));
        }
      }

      return nextFormData;
    });
  };

  const [touched, setTouched] = useState({});

  const validateSingleField = (name, value, currentFormData = formData) => {
    const data = { ...currentFormData, [name]: value };

    switch (name) {
      case "firstName":
        return validateName(value, "First name");
      case "lastName":
        return validateName(value, "Last name");
      case "countryofresidence":
        return value ? "" : "Country of residence is required.";
      case "nationality":
        return value ? "" : "Nationality is required.";
      case "email": {
        const trimmed = String(value || "").trim();
        if (!trimmed) return "Email address is required.";
        if (!isValidEmail(trimmed))
          return "Please enter a valid email address.";
        return "";
      }
      case "confirmemail": {
        const trimmed = String(value || "").trim();
        const mainEmail = String(data.email || "").trim();
        if (!trimmed) return "Please confirm your email address.";
        if (!isValidEmail(trimmed))
          return "Please enter a valid email address.";
        if (trimmed.toLowerCase() !== mainEmail.toLowerCase())
          return "Email addresses do not match.";
        return "";
      }
      case "mobile": {
        const phoneVal = validatePhoneNumber(
          value,
          data.phoneCode,
          data.phoneCountry || selectedCountry?.value || selectedCountry?.code,
        );
        return phoneVal.isValid ? "" : phoneVal.message;
      }
      case "company":
        return validateCompanyName(value);
      case "companyType":
        return value ? "" : "Company type is required.";
      case "industry":
        return value ? "" : "Industry is required.";
      case "jobTitle":
        return validateJobTitle(value);
      case "terms":
        return value ? "" : "You must accept this acknowledgement.";
      case "ageConfirm":
        return value ? "" : "Age confirmation is required.";
      default:
        return "";
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errorMsg = validateSingleField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  /*
   * ----------------------------------------------------
   * NORMAL INPUT CHANGE
   * ----------------------------------------------------
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const nextFormData = {
        ...previous,
        [name]: value,
      };

      if (touched[name] || errors[name]) {
        const errorMsg = validateSingleField(name, value, nextFormData);
        setErrors((prev) => ({
          ...prev,
          [name]: errorMsg,
        }));
      }

      if (name === "email") {
        if (touched.confirmemail || errors.confirmemail) {
          const confirmErr = validateSingleField(
            "confirmemail",
            previous.confirmemail,
            nextFormData,
          );
          setErrors((prev) => ({
            ...prev,
            confirmemail: confirmErr,
          }));
        }
      }

      return nextFormData;
    });

    if (name === "promoCode") {
      setCouponData({});
      setPromoState({ loading: false, message: "", success: false });
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

    setFormData((previous) => {
      const nextFormData = {
        ...previous,
        countryofresidence: value,
        phoneCode: newPhoneCode || previous.phoneCode,
        phoneCountry: value,
      };

      if (touched.countryofresidence || errors.countryofresidence) {
        const countryErr = validateSingleField(
          "countryofresidence",
          value,
          nextFormData,
        );
        setErrors((prev) => ({ ...prev, countryofresidence: countryErr }));
      }

      if (touched.mobile || errors.mobile || previous.mobile) {
        const mobileErr = validateSingleField(
          "mobile",
          previous.mobile,
          nextFormData,
        );
        setErrors((prev) => ({ ...prev, mobile: mobileErr }));
      }

      return nextFormData;
    });
  };

  /*
   * ----------------------------------------------------
   * VALIDATION
   * ----------------------------------------------------
   */

  const validateForm = () => {
    const validationErrors = {};

    const firstNameErr = validateName(formData.firstName, "First name");
    if (firstNameErr) {
      validationErrors.firstName = firstNameErr;
    }

    const lastNameErr = validateName(formData.lastName, "Last name");
    if (lastNameErr) {
      validationErrors.lastName = lastNameErr;
    }

    if (!formData.countryofresidence) {
      validationErrors.countryofresidence = "Country of residence is required.";
    }

    if (!formData.nationality) {
      validationErrors.nationality = "Nationality is required.";
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      validationErrors.email = "Email address is required.";
    } else if (!isValidEmail(trimmedEmail)) {
      validationErrors.email = "Please enter a valid email address.";
    }

    const trimmedConfirmEmail = formData.confirmemail.trim();
    if (!trimmedConfirmEmail) {
      validationErrors.confirmemail = "Please confirm your email address.";
    } else if (!isValidEmail(trimmedConfirmEmail)) {
      validationErrors.confirmemail =
        "Please enter a valid confirmation email address.";
    } else if (
      trimmedEmail.toLowerCase() !== trimmedConfirmEmail.toLowerCase()
    ) {
      validationErrors.confirmemail = "Email addresses do not match.";
    }

    const phoneValidation = validatePhoneNumber(
      formData.mobile,
      phoneCode,
      formData.phoneCountry || selectedCountry?.value || selectedCountry?.code,
    );
    if (!phoneValidation.isValid) {
      validationErrors.mobile = phoneValidation.message;
    }

    const companyErr = validateCompanyName(formData.company);
    if (companyErr) {
      validationErrors.company = companyErr;
    }

    if (!formData.companyType) {
      validationErrors.companyType = "Company type is required.";
    }

    if (!formData.industry) {
      validationErrors.industry = "Industry is required.";
    }

    const jobTitleErr = validateJobTitle(formData.jobTitle);
    if (jobTitleErr) {
      validationErrors.jobTitle = jobTitleErr;
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

    if (formData.visa_required === "yes") {
      const visaValidation = validateVisaForm(visaForm);
      if (!visaValidation.isValid) {
        const firstVisaErr = Object.values(visaValidation.errors)[0];
        validationErrors.visa_required =
          firstVisaErr || "Complete your visa invitation letter details.";
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
   * SUBMIT
   * ----------------------------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    setErrors({});

    setTouched({
      firstName: true,
      lastName: true,
      countryofresidence: true,
      nationality: true,
      email: true,
      confirmemail: true,
      mobile: true,
      company: true,
      companyType: true,
      industry: true,
      jobTitle: true,
      interests: true,
      terms: true,
      ageConfirm: true,
      visa_required: true,
    });

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
    const cleanPhoneCode = `+${String(phoneCode).replace(/\D/g, "")}`;

    try {
      setSubmitting(true);

      const recaptchaToken = await executeRecaptcha(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
      );

      const submission = new FormData();
      submission.append("firstName", formData.firstName.trim());
      submission.append("lastName", formData.lastName.trim());
      submission.append("email", formData.email.trim());
      submission.append("mobile", cleanMobile);
      submission.append("phoneCode", cleanPhoneCode);
      submission.append("countryofresidence", formData.countryofresidence);
      submission.append("nationality", formData.nationality);
      submission.append("company", formData.company.trim());
      submission.append("companyType", formData.companyType);
      submission.append("industry", formData.industry);
      submission.append("jobTitle", formData.jobTitle.trim());

      if (Array.isArray(formData.interests)) {
        formData.interests.forEach((interest) => {
          submission.append("interests", String(interest));
        });
      }

      submission.append(
        "marketingConsent",
        formData.marketingConsent ? "1" : "0",
      );
      submission.append(
        "visa_required",
        formData.visa_required === "yes" ? "yes" : "no",
      );

      if (formData.visa_required === "yes" && visaForm) {
        if (
          visaForm.visa_dob?.yyyy &&
          visaForm.visa_dob?.mm &&
          visaForm.visa_dob?.dd
        ) {
          submission.append(
            "visa_dob",
            `${visaForm.visa_dob.yyyy}-${visaForm.visa_dob.mm}-${visaForm.visa_dob.dd}`,
          );
        }
        if (
          visaForm.passport_expiry_date?.yyyy &&
          visaForm.passport_expiry_date?.mm &&
          visaForm.passport_expiry_date?.dd
        ) {
          submission.append(
            "passport_expiry_date",
            `${visaForm.passport_expiry_date.yyyy}-${visaForm.passport_expiry_date.mm}-${visaForm.passport_expiry_date.dd}`,
          );
        }
        if (visaForm.passport_nationality) {
          submission.append(
            "passport_nationality",
            visaForm.passport_nationality,
          );
        }
        if (visaForm.passport_country) {
          submission.append("passport_country", visaForm.passport_country);
        }
        if (visaForm.passport_fullname) {
          submission.append("passport_fullname", visaForm.passport_fullname);
        }
        if (visaForm.passport_number) {
          submission.append("passport_number", visaForm.passport_number);
        }
      }

      if (formData.registrationId) {
        submission.append("registrationId", formData.registrationId);
      }

      submission.append("recaptchaToken", recaptchaToken);

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
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const [visaModalError, setVisaModalError] = useState("");

  const handleVisaSubmit = () => {
    const visaValidation = validateVisaForm(visaForm);
    if (!visaValidation.isValid) {
      const firstErr = Object.values(visaValidation.errors)[0];
      setErrors((previous) => ({
        ...previous,
        visa_required:
          firstErr || "Complete all visa invitation letter fields.",
      }));
      setVisaModalError(
        firstErr || "Please complete all visa fields correctly.",
      );
      return;
    }

    setErrors((previous) => ({ ...previous, visa_required: "" }));
    setVisaModalError("");
    setShowVisaModal(false);
  };

  /*
   * ----------------------------------------------------
   * PROMO VALIDATE
   * ----------------------------------------------------
   */

  const handlePromoValidate = async () => {
    if (promoState.loading || promoLoadingRef.current) return;

    promoLoadingRef.current = true;
    setPromoState({ loading: true, message: "", success: false });
    const result = await validatePromoCodeAction({
      couponCode: formData.promoCode,
      email: formData.email,
      ticketId: selectedTicket?.id,
      price: selectedTicket?.priceAmount,
      currency: currency || selectedTicket?.currency || "NGN",
    });

    if (result?.success) {
      setCouponData(result.couponData || {});
      setPromoState({
        loading: false,
        message: result.message || "Promo code applied.",
        success: true,
      });
      promoLoadingRef.current = false;
      return;
    }

    setCouponData({});
    setPromoState({
      loading: false,
      message: result?.message || "Invalid promo code.",
      success: false,
    });
    promoLoadingRef.current = false;
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
                      onBlur={() => handleBlur("firstName")}
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
                      onBlur={() => handleBlur("lastName")}
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
                      onBlur={() => handleBlur("email")}
                      error={errors.email}
                      autoComplete="email"
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
                      onBlur={() => handleBlur("confirmemail")}
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
                      onBlur={() => handleBlur("mobile")}
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
                      onBlur={() => handleBlur("jobTitle")}
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
                      onBlur={() => handleBlur("company")}
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
                        <div className="registration-upload-img-wrapper">
                          {documentPreviewUrl ? (
                            <img
                              src={documentPreviewUrl}
                              alt="Cropped document preview"
                            />
                          ) : (
                            <Upload aria-hidden="true" size={28} />
                          )}
                        </div>
                        <div className="registration-upload-info">
                          <span className="registration-upload-filename">
                            {documentFile.name}
                          </span>
                          <span className="registration-upload-filesize">
                            {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <button
                            type="button"
                            className="registration-upload-change-btn"
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
                          <X aria-hidden="true" size={16} />
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
        error={visaModalError}
        isLoading={false}
      />
    </>
  );
}
