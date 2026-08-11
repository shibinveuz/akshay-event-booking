export default function CheckboxField({
  id,
  name,
  checked = false,
  onChange,
  label,
  required = false,
  error,
}) {
  return (
    <div className="form-check clickable-area">
      <input
        className={`form-check-input ${error ? "is-invalid" : ""}`}
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        required={required}
      />

      <label className="form-check-label clickable-label" htmlFor={id}>
        <span>{label}</span>

        {required && <span className="required"> *</span>}
      </label>

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
