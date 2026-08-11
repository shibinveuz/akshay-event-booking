"use client";

import React from "react";

export default function InputField({
  id,
  name,
  type = "text",
  label,
  required = false,
  value = "",
  onChange,
  onBlur,
  onCopy,
  onPaste,
  autoComplete,
  error,
  placeholder = " ",
  disabled = false,
  className = "",
  containerClassName = "",
  ...rest
}) {
  return (
    <div className={`floating-label-wrapper ${containerClassName}`.trim()}>
      <div className="floating-label">
        <input
          id={id}
          name={name || id}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onCopy={onCopy}
          onPaste={onPaste}
          disabled={disabled}
          className={className}
          {...rest}
        />
        {label ? (
          <label htmlFor={id}>
            {label} {required ? <span className="required">*</span> : null}
          </label>
        ) : null}
      </div>
      {error ? (
        <div className="invalid-feedback d-block" id={`${id || name}Error`}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
