function normalizeOptions(options) {
  return options
    .map((interest) => {
      if (typeof interest === "string") {
        return { label: interest, value: interest };
      }

      return {
        label: interest?.name || interest?.product_name || interest?.title || "",
        value: interest?.value ?? interest?.id,
      };
    })
    .filter(
      (interest) =>
        interest.label && interest.value !== null && interest.value !== undefined,
    );
}

export function getRequiredInterestCount(options = []) {
  return Math.min(3, normalizeOptions(options).length);
}

export default function InterestSelection({
  options = [],
  selected = [],
  onChange,
  error,
  readOnly = false,
  required = true,
}) {
  const normalizedOptions = normalizeOptions(options);
  const optionValueSet = new Set(
    normalizedOptions.map((opt) => String(opt.value)),
  );
  const validSelected = Array.from(
    new Set((Array.isArray(selected) ? selected : []).map(String)),
  ).filter((val) => optionValueSet.has(val));

  const isSelected = (value) => validSelected.includes(String(value));
  const visibleOptions = normalizedOptions;

  if (visibleOptions.length === 0) return null;

  const toggleInterest = (value) => {
    if (readOnly || typeof onChange !== "function") return;

    const strValue = String(value);
    if (isSelected(value)) {
      const updated = validSelected.filter((item) => item !== strValue);
      onChange(updated);
      return;
    }

    const updated = [...validSelected, value];
    onChange(updated);
  };

  return (
    <div className="mt-4">
      <h5 className="mb-3 im-intresting">
        I am interested in sourcing the following solutions/products?{" "}
        {required && <span className="required">*</span>}
      </h5>

      {!readOnly && (
        <div className="interest-counter mb-3">
          <span className="badge bg-secondary">{validSelected.length} selected</span>

          <span className="text-muted ms-2">
            Minimum {getRequiredInterestCount(options)} selection required
          </span>
        </div>
      )}

      <div className="interest-selection">
        {visibleOptions.map((interest) => {
          const active = isSelected(interest.value);

          return (
            <div
              key={interest.value}
              className={`interest-btn ${active ? "selected" : ""} ${
                readOnly ? "has-services-available" : ""
              }`}
              role={readOnly ? undefined : "button"}
              tabIndex={readOnly ? undefined : 0}
              style={readOnly ? { cursor: "default" } : undefined}
              onClick={readOnly ? undefined : () => toggleInterest(interest.value)}
              onKeyDown={
                readOnly
                  ? undefined
                  : (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggleInterest(interest.value);
                      }
                    }
              }
            >
              <div className="interest-btn-content">
                <span className="interest-btn-text">{interest.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
