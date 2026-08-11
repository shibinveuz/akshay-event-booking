"use client";

import { useState } from "react";

import { Pencil, Save, X } from "lucide-react";

export default function VisitorProfileDetails({ visitor }) {
  const [editing, setEditing] = useState(false);

  const [fields, setFields] = useState({
    firstName: visitor.firstName || "",
    lastName: visitor.lastName || "",
    country: visitor.country || "",
    nationality: visitor.nationality || "",
    mobile: visitor.mobile || "",
    email: visitor.email || "",
    company: visitor.company || "",
    jobTitle: visitor.jobTitle || "",
    companyType: visitor.companyType || "",
    industry: visitor.industry || "",
    investorType: visitor.investorType || "",
  });

  const setField = (name, value) => {
    setFields((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    console.log("Updated visitor:", fields);

    /*
      Later call Server Action:
      await updateVisitorAction(fields)
    */

    setEditing(false);
  };

  const detailFields = [
    {
      key: "firstName",
      label: "First name",
    },
    {
      key: "lastName",
      label: "Last name",
    },
    {
      key: "country",
      label: "Country of residence",
    },
    {
      key: "nationality",
      label: "Nationality",
    },
    {
      key: "mobile",
      label: "Mobile number",
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
    },
    {
      key: "company",
      label: "Company name",
    },
    {
      key: "jobTitle",
      label: "Job title",
    },
    {
      key: "companyType",
      label: "Company type",
    },
    {
      key: "industry",
      label: "Industry",
    },
    {
      key: "investorType",
      label: "Are you an investor?",
    },
  ];

  return (
    <div className="details-section" id="visitorRegform">
      <div className="details-header">
        <h2 className="details-title">Your Details</h2>

        {!editing ? (
          <button
            type="button"
            className="edit-btn"
            onClick={() => setEditing(true)}
          >
            <Pencil size={16} />
            Edit
          </button>
        ) : (
          <div className="d-flex gap-2">
            <button type="button" className="edit-btn" onClick={handleSave}>
              <Save size={16} />
              Save
            </button>

            <button
              type="button"
              className="edit-btn"
              onClick={() => setEditing(false)}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="details-grid">
        {detailFields.map((field) => (
          <div className="detail-field" key={field.key}>
            <label className="detail-label">{field.label}</label>

            {!editing ? (
              <div className="detail-value">{fields[field.key] || "-"}</div>
            ) : (
              <input
                type={field.type || "text"}
                className="detail-input"
                value={fields[field.key]}
                onChange={(event) => setField(field.key, event.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h5 className="mb-3">
          I am interested in sourcing the following solutions/products?
        </h5>

        <div className="interest-selection">
          {visitor.interests?.map((interest) => (
            <div className="interest-btn has-services-available" key={interest}>
              <div className="interest-btn-content">
                <span className="interest-btn-text">{interest}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
