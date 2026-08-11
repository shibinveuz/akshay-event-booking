"use client";

import CountryCodeDropdown from "./CountryCodeDropdown";
import styles from "./PhoneField.module.css";

export default function PhoneField({ fields, setField, error, countriesList }) {
  const mobile = fields?.mobile || "";
  const phoneCode = fields?.phoneCode || "234";

  return (
    <div className={styles.fieldGroupWrapper}>
      <div className={styles.fieldGroup}>
        <div
          className={`${styles.phoneInputWrapper} ${
            mobile ? styles.hasValue : ""
          } ${error ? styles.error : ""}`}
        >
          <CountryCodeDropdown
            value={phoneCode}
            onChange={(code) => setField("phoneCode", code)}
            countriesList={countriesList}
          />

          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={mobile}
            onChange={(event) =>
              setField("mobile", event.target.value.replace(/[^\d\s-]/g, ""))
            }
            placeholder=" "
            autoComplete="tel"
            required
            className={styles.phoneInput}
          />

          <label
            htmlFor="mobile"
            className={`${styles.phoneLabel} ${mobile ? styles.floating : ""}`}
          >
            Mobile Number
            <span className="required"> *</span>
          </label>
        </div>

        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>
    </div>
  );
}
