"use client";

import React from "react";

const LogoutConfirmModal = ({ show, onHide, onClick, isLoading }) => {
  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} />
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1050 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-md modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header service-wizard-header">
              {/* <h5 className="modal-title" id="solutionsModalLabel">
                              SELECT SOLUTIONS / PRODUCTS
                          </h5> */}
              {!isLoading && (
                <button type="button" className="btn-close" onClick={onHide} />
              )}
            </div>
            <div className="modal-body" style={{ direction: "ltr" }}>
              Are you sure you want to Logout?
            </div>
            <div className="modal-footer">
              {!isLoading && (
                <button
                  type="button"
                  className="btn btn-wizard-secondary"
                  onClick={onHide}
                >
                  NO
                </button>
              )}
              {isLoading ? (
                <button
                  type="button"
                  className="btn btn-wizard-primary"
                  id="applyBtn"
                >
                  Processing...
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-wizard-primary"
                  id="applyBtn"
                  onClick={onClick}
                >
                  YES
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutConfirmModal;
