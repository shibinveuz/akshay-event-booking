import CheckboxField from "@/app/components/form/CheckboxField";

export default function TermsSection({ formData, errors, onCheckboxChange }) {
  return (
    <div className="terms-section">
      <h5>Terms Acknowledgement</h5>

      <CheckboxField
        id="terms"
        name="terms"
        checked={formData.terms}
        onChange={onCheckboxChange}
        required
        error={errors.terms}
        label="I understand that if I allow an exhibitor or sponsor at the event to scan my badge, whether physical or digital, I am providing them with my personal data. I acknowledge that the organizers have no control over any third-party use of this data and cannot be held liable for such use to the extent permitted by law."
      />

      <CheckboxField
        id="marketingConsent"
        name="marketingConsent"
        checked={formData.marketingConsent}
        onChange={onCheckboxChange}
        label="I consent to Kaoun International Limited and where necessary their contracted service providers, exhibitors, sponsors, and partners, using my personal data for communications & marketing their products, services, and future events. I understand that I can withdraw my consent at any time."
      />

      <CheckboxField
        id="ageConfirm"
        name="ageConfirm"
        checked={formData.ageConfirm}
        onChange={onCheckboxChange}
        required
        error={errors.ageConfirm}
        label="I confirm that I am 21 years of age or older, and I have read and agree to the Terms & Conditions and Privacy Policy."
      />
    </div>
  );
}
