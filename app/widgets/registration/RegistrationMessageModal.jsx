"use client";

export default function RegistrationMessageModal({
  show,
  type = "success",
  onHide,
  onConfirm,
}) {
  const isSuccess = type === "success";

  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show service-wizard-modal"
        style={{ display: "block" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`registration-${type}-modal-title`}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header service-wizard-header">
              <h5
                className="modal-title"
                id={`registration-${type}-modal-title`}
              >
                GITEX Nigeria 2026
              </h5>

              {!isSuccess && (
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={onHide}
                />
              )}
            </div>

            <div className="modal-body service-wizard-body">
              <div className="dont_miss_registration text-center">
                {isSuccess ? (
                  <>
                    <h2>Registration Submitted!</h2>

                    <p>Your registration has been successfully completed.</p>
                  </>
                ) : (
                  <>
                    <h2>Don&apos;t Miss Your Registration</h2>

                    <p>
                      Your registration is still incomplete. Please continue
                      and complete the form to secure your pass.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div
              className="modal-footer wizard-buttons"
              style={{ justifyContent: "center" }}
            >
              <button
                type="button"
                className="btn btn-wizard-primary"
                onClick={onConfirm}
              >
                {isSuccess ? "Continue" : "Resume Registration"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
