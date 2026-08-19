"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, X } from "lucide-react";
import { updateVisitorProfileAction } from "@/app/lib/api/visitor";
import { mapCountryOptions } from "@/app/lib/countries";
import InputField from "@/app/components/form/InputField";
import SelectField from "@/app/components/form/SelectField/SelectField";
import PhoneField from "@/app/components/form/PhoneField/PhoneField";
import InterestSelection from "@/app/widgets/registration/InterestSelection";
import VisaQuestion from "@/app/widgets/registration/VisaQuestion";
import VisaApplicationModal from "@/app/widgets/registration/VisaApplicationModal";
import {
  COMPANY_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
} from "@/app/widgets/registration/profileOptions";

function createFields(visitor) {
  return {
    firstName: visitor.firstName || "",
    lastName: visitor.lastName || "",
    country: visitor.country || "",
    nationality: visitor.nationality || "",
    mobile: visitor.mobile || "",
    email: visitor.email || "",
    confirmEmail: visitor.email || "",
    company: visitor.company || "",
    jobTitle: visitor.jobTitle || "",
    companyType: visitor.companyType || "",
    industry: visitor.industry || "",
    visaRequired: visitor.visaRequested ? "yes" : "no",
    phoneCode: visitor.phoneCode || "",
    phoneCountry: visitor.countryCode || "",
    countryCode: visitor.countryCode || "",
    nationalityCode: visitor.nationalityCode || "",
    interestIds: visitor.interestIds || [],
  };
}

function includeCurrentOption(
  options,
  value,
  labelKey = "label",
  valueKey = "value",
) {
  if (!value || options.some((option) => option[valueKey] === value)) {
    return options;
  }
  return [...options, { [labelKey]: value, [valueKey]: value }];
}

export default function VisitorProfileDetails({
  visitor,
  countries = [],
  editing,
  onEditingChange,
  loadCountries,
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState({});
  const [showVisaModal, setShowVisaModal] = useState(false);
  const [fields, setFields] = useState(() => createFields(visitor));
  const countryOptions = useMemo(
    () => mapCountryOptions(countries),
    [countries],
  );
  const companyTypeOptions = includeCurrentOption(
    COMPANY_TYPE_OPTIONS,
    fields.companyType,
  );
  const industryOptions = includeCurrentOption(
    INDUSTRY_OPTIONS,
    fields.industry,
    "name",
    "code",
  );
  const setField = (name, value) => {
    setFields((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const findCountryOption = (value, label) =>
    countryOptions.find(
      (option) =>
        String(option.value) === String(value) ||
        option.label.toLowerCase() === String(label || "").toLowerCase(),
    );

  const selectedCountry = findCountryOption(fields.countryCode, fields.country);
  const selectedNationality = findCountryOption(
    fields.nationalityCode,
    fields.nationality,
  );

  const validate = () => {
    const nextErrors = {};
    if (!selectedCountry)
      nextErrors.countryCode = "Country of residence is required.";
    if (!selectedNationality)
      nextErrors.nationalityCode = "Nationality is required.";
    if (!fields.mobile.trim()) nextErrors.mobile = "Mobile number is required.";
    if (!fields.company.trim())
      nextErrors.company = "Company name is required.";
    if (!fields.jobTitle.trim()) nextErrors.jobTitle = "Job title is required.";
    if (!fields.companyType)
      nextErrors.companyType = "Company type is required.";
    if (!fields.industry) nextErrors.industry = "Industry is required.";
    if (!fields.visaRequired)
      nextErrors.visaRequired =
        "Please select whether you require a visa invitation letter.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const savingRef = useRef(false);

  const handleSave = async () => {
    if (saving || savingRef.current || !validate()) return;
    savingRef.current = true;
    setSaving(true);
    setApiError("");
    setMessage("");

    try {
      const result = await updateVisitorProfileAction(fields);
      if (!result?.success) {
        setApiError(result?.message || "Unable to update your profile.");
        return;
      }

      setMessage(result.message || "Your details were updated successfully.");
      onEditingChange(false);
      router.refresh();
    } catch (error) {
      console.error("Profile update request failed:", error);
      setApiError(
        "The profile request could not reach the server. Check your connection and try again.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const detailFields = [
    ["firstName", "First name"],
    ["lastName", "Last name"],
    ["country", "Country of residence"],
    ["nationality", "Nationality"],
    ["mobile", "Mobile number"],
    ["email", "Email Address"],
    ["company", "Company name"],
    ["jobTitle", "Job title"],
    ["companyType", "Company type"],
    ["industry", "Industry"],
  ];
  const configuredInterestOptions = visitor.interestOptions || [];
  const displayInterestOptions = (visitor.interests || []).map(
    (interest, index) => ({
      id: visitor.interestIds?.[index] ?? interest,
      name: interest,
    }),
  );
  const hasEditableInterestOptions = configuredInterestOptions.length > 0;
  const interestOptions =
    hasEditableInterestOptions
      ? configuredInterestOptions
      : displayInterestOptions;
  const rawSelectedInterests =
    fields.interestIds?.length > 0
      ? fields.interestIds
      : visitor.interestIds?.length > 0
        ? visitor.interestIds
        : displayInterestOptions.map((interest) => interest.id);

  const optionValueSet = new Set(
    interestOptions.map((opt) => String(opt.id ?? opt.value)),
  );
  const selectedInterests = Array.from(
    new Set((rawSelectedInterests || []).map(String)),
  ).filter((val) => optionValueSet.size === 0 || optionValueSet.has(val));

  return (
    <div className="details-section" id="visitorRegform">
      <div className="details-header">
        <h2 className="details-title">Your Details</h2>
        {!editing ? (
          <button
            type="button"
            className="edit-btn"
            onClick={() => {
              setMessage("");
              setFields(createFields(visitor));
              setShowVisaModal(false);
              onEditingChange(true);
            }}
          >
            <Pencil size={16} aria-hidden="true" />
            <span className="edit-btn-label">Edit</span>
          </button>
        ) : (
          <button
            type="button"
            className="edit-btn"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} aria-hidden="true" />
            <span className="edit-btn-label">
              {saving ? "Saving..." : "Save"}
            </span>
          </button>
        )}
      </div>

      {apiError && <div className="text-danger mt-3">{apiError}</div>}
      {message && <div className="text-success mt-3">{message}</div>}

      {!editing ? (
        <div className="details-grid">
          {detailFields.map(([key, label]) => (
            <div className="detail-field" key={key}>
              <label className="detail-label">{label}</label>
              <div className="detail-value">{visitor[key] || "-"}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="details-grid">
          <InputField
            id="visitorFirstName"
            label="First Name"
            value={fields.firstName}
            disabled
            required
          />
          <InputField
            id="visitorLastName"
            label="Last Name"
            value={fields.lastName}
            disabled
            required
          />
          <SelectField
            id="visitorCountry"
            name="countryCode"
            label="Country of Residence"
            value={selectedCountry?.value || ""}
            options={countryOptions}
            onChange={(event, option) => {
              setField("countryCode", event.target.value);
              setField("country", option?.label || "");
              setField("phoneCountry", event.target.value);
              if (option?.phoneCode) setField("phoneCode", option.phoneCode);
            }}
            error={errors.countryCode}
            isRequired
          />
          <SelectField
            id="visitorNationality"
            name="nationalityCode"
            label="Nationality"
            value={selectedNationality?.value || ""}
            options={countryOptions}
            onChange={(event, option) => {
              setField("nationalityCode", event.target.value);
              setField("nationality", option?.label || "");
            }}
            error={errors.nationalityCode}
            isRequired
          />
          <InputField
            id="visitorEmail"
            type="email"
            label="Email Address"
            value={fields.email}
            disabled
            required
          />
          <InputField
            id="visitorConfirmEmail"
            type="email"
            label="Confirm Email Address"
            value={fields.confirmEmail}
            disabled
            required
          />
          <PhoneField
            fields={fields}
            setField={setField}
            error={errors.mobile}
            countriesList={countryOptions}
          />
          <InputField
            id="visitorJobTitle"
            label="Job Title"
            value={fields.jobTitle}
            onChange={(event) => setField("jobTitle", event.target.value)}
            error={errors.jobTitle}
            required
          />
          <InputField
            id="visitorCompany"
            label="Company Name"
            value={fields.company}
            onChange={(event) => setField("company", event.target.value)}
            error={errors.company}
            required
          />
          <SelectField
            id="visitorCompanyType"
            name="companyType"
            label="Company Type"
            value={fields.companyType}
            options={companyTypeOptions}
            onChange={(event) => setField("companyType", event.target.value)}
            error={errors.companyType}
            isRequired
          />
          <SelectField
            id="visitorIndustry"
            name="industry"
            label="Which industry do you belong to?"
            value={fields.industry}
            options={industryOptions}
            labelKey="name"
            valueKey="code"
            onChange={(event) => setField("industry", event.target.value)}
            error={errors.industry}
            isRequired
          />
        </div>
      )}

      <VisaQuestion
        value={fields.visaRequired}
        error={errors.visaRequired}
        readOnly={!editing}
        onChange={(value) => {
          if (!editing) return;
          setField("visaRequired", value);
          if (value === "yes") {
            if (typeof loadCountries === "function") {
              loadCountries();
            }
            setShowVisaModal(true);
          } else {
            setShowVisaModal(false);
          }
        }}
      />

      {interestOptions.length > 0 && (
        <InterestSelection
          options={interestOptions}
          selected={selectedInterests}
          onChange={(interestIds) => setField("interestIds", interestIds)}
          readOnly={!editing || !hasEditableInterestOptions}
          required={false}
        />
      )}

      <VisaApplicationModal
        show={showVisaModal}
        onHide={() => setShowVisaModal(false)}
        countries={countries}
        registrationId=""
        initialValues={visitor.visaForm}
        accessContext="visitor"
      />
    </div>
  );
}
