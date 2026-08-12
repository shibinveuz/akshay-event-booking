import React, { useId, useState, useEffect } from "react";
import Select, { components } from "react-select";
import "./SelectField.css";
import { useTranslation } from "react-i18next";
const SelectBox = ({
  isRequired,
  label,
  error,
  labelKey = "label",
  valueKey = "value",
  options = [],
  value,
  onChange,
  id,
  ...rest
}) => {
  const generatedId = useId();
  const selectInstanceId = `select-${generatedId.replace(/:/g, "")}`;
  const [hasValue, setHasValue] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const { i18n } = useTranslation();
  const dir = i18n?.language?.includes("ar") ? "rtl" : "ltr";
  useEffect(() => {
    setHasValue(value && (Array.isArray(value) ? value.length > 0 : true));
  }, [value]);

  useEffect(() => {
    setViewportWidth(window.innerWidth);
  }, []);

  const handleChange = (selectedOption) => {
    setHasValue(
      selectedOption &&
        (Array.isArray(selectedOption) ? selectedOption.length > 0 : true),
    );
    if (onChange) {
      const event = {
        target: {
          name: rest.name,
          value: selectedOption ? selectedOption[valueKey] : "",
        },
      };
      onChange(event, selectedOption);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      direction: "ltr",
      textAlign: "left",
      height: 50,
      fontWeight: "normal",
      // padding: "5px",
      borderRadius: "8px",
      borderColor: isFocused ? "var(--primary-color)" : "#e0e0e0",
      // boxShadow: isFocused ? "0 0 0 3px rgba(1, 14, 255, 0.1)" : "none",
      boxShadow: "none",
      backgroundColor: "transparent",
      "&:hover": {
        borderColor: isFocused ? "var(--primary-color)" : "#e0e0e0",
      },
    }),

    option: (provided, state) => ({
      ...provided,
      textAlign: "left", // force text to start from left
      direction: "ltr", // force option rendering left-to-right
      fontWeight: "normal",
      backgroundColor: state.isSelected
        ? "#f8f9fa " // selected
        : state.isFocused
          ? "#fff" // hover/focus
          : "#fff", // normal
      color: state.isSelected ? "var(--primary-color)" : "#333", // normal text
      ":active": {
        backgroundColor: "var(--primary-color)",
        color: "#fff",
      },
      "&:hover": {
        backgroundColor: "var(--primary-color)",
        color: "#fff",
      },
    }),
    menu: (provided) => ({
      ...provided,
      direction: "ltr",
      textAlign: "left",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      fontWeight: "normal",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
      direction: "ltr",
      textAlign: "left",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#C8E6C9",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#2E7D32",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      direction: "ltr",
      color: "#2E7D32",
      ":hover": {
        backgroundColor: "#81C784",
        color: "white",
      },
    }),
    input: (base) => ({
      ...base,
      borderColor: isFocused ? "none" : "#e0e0e0",
      boxShadow: isFocused ? "none" : "none",
      paddingBottom: 0,
      paddingTop: 0,
      margin: 0,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: viewportWidth < 480 ? 140 : viewportWidth < 768 ? 180 : 200,
      overflowY: "auto",
    }),
  };

  const containerClass = `floating-label ${error ? "error" : ""} ${
    hasValue || isFocused ? "has-select-value" : ""
  }`;
  const customComponents = {
    Input: (props) => (
      <components.Input
        {...props}
        innerRef={(ref) => {
          if (ref) {
            ref.autoComplete = "off";
          }
          props.innerRef(ref);
        }}
      />
    ),
  };
  return (
    <div className="floating-label-wrapper">
      <div className={containerClass} id={id}>
        <Select
          instanceId={selectInstanceId}
          // components={customComponents}
          options={options}
          styles={customStyles}
          isClearable={false}
          // inputId="disable-autocomplete"
          // inputId={id}
          autoComplete="off"
          getOptionLabel={(e) => e[labelKey]}
          getOptionValue={(e) => e[valueKey]}
          menuPortalTarget={
            typeof document === "undefined" ? undefined : document.body
          }
          value={
            options && value && typeof value !== "object"
              ? options.find((opt) => opt[valueKey] === value) || value
              : value
          }
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onMenuClose={handleBlur}
          placeholder=""
          {...rest}
        />
        <label
          className="form-label"
          style={{
            left: dir === "rtl" ? "unset" : "1rem",
            right:
              dir === "rtl"
                ? hasValue || isFocused
                  ? "1rem"
                  : "3rem"
                : "unset",
          }}
        >
          {label}
          {isRequired && <span className="required"> *</span>}
        </label>
        {error && (
          <div className="invalid-feedback" style={{ display: "block" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectBox;
