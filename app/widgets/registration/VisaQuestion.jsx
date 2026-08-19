import RadioField from "@/app/components/form/RadioField/RadioField";

export default function VisaQuestion({
  value,
  error,
  onChange,
  readOnly = false,
  disabled = false,
}) {
  const isInteractive = !readOnly && !disabled;
  return (
    <div className="mt-2 mb-4 d-flex">
      <label style={{ marginRight: 10 }}>
        Do you need a visa invitation letter?
        <span className="required"> *</span>
      </label>

      <br className="visa-break-lg" />

      {/* <label>
        <input
          type="radio"
          name="visa_required"
          value="yes"
          checked={value === "yes"}
          disabled={!isInteractive}
          onChange={() => isInteractive && onChange?.("yes")}
          style={{ marginRight: 5 }}
        />
        Yes
      </label>

      <label style={{ marginLeft: 10 }}>
        <input
          type="radio"
          name="visa_required"
          value="no"
          checked={value === "no"}
          disabled={!isInteractive}
          onChange={() => isInteractive && onChange?.("no")}
          style={{ marginRight: 5 }}
        />
        No
      </label> */}
      <div className="d-flex gap-3">
        <RadioField
          id="visa_required_yes"
          name="visa_required"
          value="yes"
          label="Yes"
          checked={value === "yes"}
          disabled={!isInteractive}
          onChange={() => isInteractive && onChange?.("yes")}
        />

        <RadioField
          id="visa_required_no"
          name="visa_required"
          value="no"
          label="No"
          checked={value === "no"}
          disabled={!isInteractive}
          onChange={() => isInteractive && onChange?.("no")}
        />
      </div>

      {error && (
        <div className="invalid-feedback" style={{ display: "block" }}>
          {error}
        </div>
      )}
    </div>
  );
}
