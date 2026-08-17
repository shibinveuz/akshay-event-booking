export default function VisaQuestion({ value, error, onChange }) {
  return (
    <div className="mt-2 mb-4 d-flex">
      <label style={{ marginRight: 10 }}>
        Do you need a visa invitation letter?
        <span className="required"> *</span>
      </label>

      <br className="visa-break-lg" />

      <label>
        <input
          type="radio"
          name="visa_required"
          value="yes"
          checked={value === "yes"}
          onChange={() => onChange("yes")}
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
          onChange={() => onChange("no")}
          style={{ marginRight: 5 }}
        />
        No
      </label>

      {error && (
        <div className="invalid-feedback" style={{ display: "block" }}>
          {error}
        </div>
      )}
    </div>
  );
}
