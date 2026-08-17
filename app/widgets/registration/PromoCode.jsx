export default function PromoCode({
  promoCode,
  onChange,
  onValidate,
  loading = false,
  message = "",
  success = false,
}) {
  return (
    <div className="reg-form-promodiv">
      <div className="reg-form-promodiv-bg">
        <div className="reg-form-promodiv-inner">
          <input
            type="text"
            name="promoCode"
            value={promoCode}
            onChange={onChange}
            placeholder="Enter Your PromoCode"
          />

          <button
            className="promo-bg-btn buy-btn"
            type="button"
            onClick={onValidate}
            disabled={loading}
          >
            <span className="btn-text">{loading ? "VALIDATING..." : "VALIDATE"}</span>
          </button>
        </div>

        {message && (
          <div className={success ? "text-success mt-2" : "text-danger mt-2"}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
