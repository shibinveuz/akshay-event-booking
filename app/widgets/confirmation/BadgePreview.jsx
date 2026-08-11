import Image from "next/image";

export default function BadgePreview({ data }) {
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");

  return (
    <div className="badge-preview-card">
      <div className="badge-preview-header">Badge Preview</div>

      <div className="qr-placeholder">
        <div className="text-center">
          <div className="small text-muted">
            <Image
              src="/assets/img/qr.png"
              width={150}
              height={150}
              className="img-fluid"
              alt="QR Code"
            />
          </div>
        </div>
      </div>

      <div className="badge-info">
        <div className="badge-name">{fullName || "FULL NAME"}</div>

        <div className="badge-title">{data.jobTitle || "Job Title"}</div>

        <div className="badge-company">{data.company || "Company Name"}</div>

        <div className="badge-company">
          {data.country || "Country of Residence"}
        </div>
      </div>

      <div className="visitor-badge">
        <h6>BADGE CATEGORY</h6>
        <h3>{data.badgeCategory || "VISITOR"}</h3>
      </div>

      <div className="right-car-ft">
        <p className="badge-note-external">
          <strong>Important:</strong> This is a preview of your badge
          information only. It is not valid for event entry.
        </p>
      </div>
    </div>
  );
}
