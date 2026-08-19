import styles from "./RadioField.module.css";

export default function RadioField({
  id,
  name,
  value,
  checked = false,
  onChange,
  label,
  required = false,
  disabled = false,
}) {
  return (
    <div className={styles.radioField}>
      <input
        className={styles.radioInput}
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required={required}
        disabled={disabled}
      />

      <label className={styles.radioLabel} htmlFor={id}>
        <span>{label}</span>
        {required && <span className={styles.required}> *</span>}
      </label>
    </div>
  );
}
