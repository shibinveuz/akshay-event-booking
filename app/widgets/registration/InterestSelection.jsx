const interestOptions = [
  {
    value: "Artificial",
    label: "Artificial Intelligence",
    hasProducts: false,
  },
  {
    value: "Smart",
    label: "Smart Cities",
    hasProducts: false,
  },
  {
    value: "Software",
    label: "Software Services",
    hasProducts: false,
  },
  {
    value: "BigData",
    label: "Big Data & Analytics",
    hasProducts: true,
  },
  {
    value: "CloudServices",
    label: "Cloud Services",
    hasProducts: true,
  },
];

export default function InterestSelection({ selected = [], onChange, error }) {
  const toggleInterest = (interest) => {
    if (selected.includes(interest.value)) {
      onChange(selected.filter((item) => item !== interest.value));
      return;
    }

    onChange([...selected, interest.value]);
  };

  return (
    <div className="mt-4">
      <h5 className="mb-3 im-intresting">
        I am interested in sourcing the following solutions/products?{" "}
        <span className="required">*</span>
      </h5>

      <div className="interest-counter mb-3">
        <span className="badge bg-secondary">{selected.length} selected</span>

        <span className="text-muted ms-2">Minimum 3 selection required</span>
      </div>

      <div className="interest-selection">
        {interestOptions.map((interest) => {
          const active = selected.includes(interest.value);

          return (
            <div
              key={interest.value}
              className={`interest-btn has-services-available ${
                active ? "selected" : ""
              }`}
              role="button"
              tabIndex={0}
              onClick={() => toggleInterest(interest)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  toggleInterest(interest);
                }
              }}
            >
              <div className="interest-btn-content">
                <span className="interest-btn-text">{interest.label}</span>
              </div>

              <div className="d-flex gap-1">
                <span className="services-indicator">
                  {interest.hasProducts
                    ? "Product Category Available"
                    : "Product Categories not Available"}
                </span>

                {interest.hasProducts && (
                  <div className="interest-btn-actions">
                    <button
                      type="button"
                      className="select-services-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      Select Product Categories
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
