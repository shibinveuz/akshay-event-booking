"use client";

import { useState } from "react";

export default function SelectField({
  id,
  name,
  label,
  value,
  options = [],
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
}) {
  const [focused, setFocused] = useState(false);

  const normalizedOptions = options.map((option) =>
    typeof option === "object"
      ? {
          ...option,
          label: option.label ?? option.name ?? String(option.value ?? ""),
          value: option.value ?? option.code ?? option.id ?? "",
        }
      : { label: option, value: option },
  );
  const hasValue = String(value ?? "") !== "";

  return (
    <div className="floating-label-wrapper">
      <div
        className={`floating-label${
          focused || hasValue ? " has-select-value" : ""
        }${error ? " error" : ""}`}
      >
        <select
          id={id || name}
          name={name}
          value={value ?? ""}
          required={required}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        >
          <option value="" disabled hidden />
          {normalizedOptions.map((option) => (
            <option key={String(option.value)} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor={id || name}>
          {label}
          {required && <span className="required"> *</span>}
        </label>
      </div>
      {error ? <div className="invalid-feedback d-block">{error}</div> : null}
    </div>
  );
}
