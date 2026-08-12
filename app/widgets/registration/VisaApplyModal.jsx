"use client";

import InputField from "@/app/components/form/InputField";
import SelectField from "@/app/components/form/SelectField/SelectField";

export default function VisaApplyModal({
  show,
  onHide,
  visaForm,
  setVisaField,
  setVisaDateField,
  countries = [],
  onSubmit,
  isLoading = false,
}) {
  const countryOptions = countries.map((country) => ({
    label: country.label || country.name || country.country_name || "",
    value:
      country.value || country.code || country.country_code || country.id || "",
  }));

  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const val = String(i + 1).padStart(2, "0");
    return { label: val, value: val };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const val = String(i + 1).padStart(2, "0");
    return { label: val, value: val };
  });

  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1999 }} />
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 2000 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visa-apply-modal-title"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header service-wizard-header">
              <h5 className="modal-title" id="visa-apply-modal-title">
                Visa Invitation Letter Application
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onHide}
              />
            </div>

            <div className="modal-body service-wizard-body visa-modal">
              <form
                id="passportForm"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmit();
                }}
              >
                <div className="row">
                  <div className="col-xl-6 col-md-12 mt-40">
                    <InputField
                      id="passport_fullname"
                      name="passport_fullname"
                      label="Full Name as in International Passport"
                      value={visaForm.passport_fullname}
                      onChange={(event) =>
                        setVisaField("passport_fullname", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-xl-6 col-md-12">
                    <h6 className="passport-label">
                      Date of Birth
                      <span className="required"> *</span>
                    </h6>

                    <div className="visa-reg-form-select">
                      <SelectField
                        id="visa_dob_dd"
                        label="DD"
                        value={visaForm.visa_dob.dd}
                        options={dayOptions}
                        onChange={(event) =>
                          setVisaDateField("visa_dob", "dd", event.target.value)
                        }
                      />

                      <SelectField
                        id="visa_dob_mm"
                        label="MM"
                        value={visaForm.visa_dob.mm}
                        options={monthOptions}
                        onChange={(event) =>
                          setVisaDateField("visa_dob", "mm", event.target.value)
                        }
                      />
                      <InputField
                        id="visa_dob_yyyy"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        label="YYYY"
                        value={visaForm.visa_dob.yyyy}
                        onChange={(event) =>
                          setVisaDateField(
                            "visa_dob",
                            "yyyy",
                            event.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-6 col-md-12 mt-40">
                    <InputField
                      id="passport_number"
                      name="passport_number"
                      label="Passport Number"
                      value={visaForm.passport_number}
                      onChange={(event) => {
                        const cleaned = event.target.value
                          .replace(/[^A-Za-z0-9]/g, "")
                          .toUpperCase();

                        setVisaField("passport_number", cleaned);
                      }}
                      required
                    />
                  </div>

                  <div className="col-xl-6 col-md-12">
                    <h6 className="passport-label">
                      Passport Expiry Date
                      <span className="required"> *</span>
                    </h6>

                    <div className="visa-reg-form-select">
                      <SelectField
                        id="passport_expiry_dd"
                        label="DD"
                        value={visaForm.passport_expiry_date.dd}
                        options={dayOptions}
                        onChange={(event) =>
                          setVisaDateField(
                            "passport_expiry_date",
                            "dd",
                            event.target.value,
                          )
                        }
                      />

                      <SelectField
                        id="passport_expiry_mm"
                        label="MM"
                        value={visaForm.passport_expiry_date.mm}
                        options={monthOptions}
                        onChange={(event) =>
                          setVisaDateField(
                            "passport_expiry_date",
                            "mm",
                            event.target.value,
                          )
                        }
                      />
                      <InputField
                        id="passport_expiry_yyyy"
                        type="text"
                        inputMode="numeric"
                        maxLength={4}
                        label="YYYY"
                        value={visaForm.passport_expiry_date.yyyy}
                        onChange={(event) =>
                          setVisaDateField(
                            "passport_expiry_date",
                            "yyyy",
                            event.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-xl-6 col-md-12">
                    <SelectField
                      id="passport_nationality"
                      name="passport_nationality"
                      label="Nationality"
                      value={visaForm.passport_nationality}
                      options={countryOptions}
                      onChange={(event) =>
                        setVisaField("passport_nationality", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-xl-6 col-md-12">
                    <SelectField
                      id="passport_country"
                      name="passport_country"
                      label="Country of Residence"
                      value={visaForm.passport_country}
                      options={countryOptions}
                      onChange={(event) =>
                        setVisaField("passport_country", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer wizard-buttons">
                  {!isLoading && (
                    <button
                      type="button"
                      className="btn btn-wizard-secondary"
                      onClick={onHide}
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    className="btn btn-wizard-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        Processing
                        <span
                          className="spinner-border spinner-border-sm ms-2"
                          role="status"
                          aria-hidden="true"
                        />
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
