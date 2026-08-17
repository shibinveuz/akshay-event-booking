"use client";

import { useState } from "react";
import CountryCodeDropdown from "./CountryCodeDropdown";
import styles from "./PhoneField.module.css";

export default function PhoneField({
  fields,
  setField,
  value = "",
  phoneCode: phoneCodeProp = "234",
  onChange,
  error,
  countriesList,
}) {
  const [focused, setFocused] = useState(false);

  const mobile = fields?.mobile ?? value;
  const phoneCode = fields?.phoneCode ?? phoneCodeProp;

  const updateField = (name, nextValue) => {
    if (setField) {
      setField(name, nextValue);
      return;
    }

    onChange?.({ target: { name, value: nextValue } });
  };

  const hasValue = Boolean(String(mobile).trim());

  return (
    <div className={styles.fieldGroupWrapper}>
      <div className={styles.fieldGroup}>
        <div
          className={`${styles.phoneInputWrapper}${
            focused ? ` ${styles.active}` : ""
          }${hasValue ? ` ${styles.hasValue}` : ""}${
            error ? ` ${styles.error}` : ""
          }`}
        >
          <CountryCodeDropdown
            value={phoneCode}
            onChange={(code, countryCode) => {
              updateField("phoneCode", code);
              updateField("phoneCountry", countryCode);
            }}
            countriesList={countriesList}
            selectedCountryCode={fields?.phoneCountry}
          />

          <input
            className={styles.phoneInput}
            type="tel"
            id="mobile"
            name="mobile"
            required
            placeholder={focused ? "Enter mobile number" : ""}
            autoComplete="tel"
            value={mobile}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(event) =>
              updateField(
                "mobile",
                event.target.value.replace(/[^\d\s-]/g, ""),
              )
            }
          />

          <label
            className={`${styles.phoneLabel}${
              focused || hasValue ? ` ${styles.floating}` : ""
            }`}
            htmlFor="mobile"
          >
            Mobile Number
            <span className="required"> *</span>
          </label>
        </div>

        <div
          className={`invalid-feedback${error ? " d-block" : ""}`}
          id="mobileError"
        >
          {error}
        </div>
      </div>
    </div>
  );
}
