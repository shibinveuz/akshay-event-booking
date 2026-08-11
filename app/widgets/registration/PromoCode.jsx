export default function PromoCode({ promoCode, onChange, onValidate }) {
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
          >
            <span className="btn-text">VALIDATE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
