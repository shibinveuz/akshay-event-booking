import Image from "next/image";

export default function VisitorBadgePreview({ visitor }) {
  const fullName = [visitor.firstName, visitor.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="badge-preview-card party-badge-design">
      <div className="badge-preview-header">Badge Preview</div>

      <div className="qr-placeholder">
        <div className="text-center">
          <div className="small text-muted">
            <Image
              src="/assets/img/qr.png"
              width={150}
              height={150}
              className="img-fluid"
              alt="Badge QR code"
            />
          </div>
        </div>
      </div>

      <div className="badge-info">
        <div className="badge-name">{fullName || "FULL NAME"}</div>

        <div className="badge-title">{visitor.jobTitle || "Job Title"}</div>

        <div className="badge-company">{visitor.company || "Company Name"}</div>

        <div className="badge-company">
          {visitor.country || "Country of Residence"}
        </div>
      </div>

      <div className="visitor-badge">
        <h6>BADGE CATEGORY</h6>

        <h3>{visitor.badgeCategory || "VISITOR"}</h3>
      </div>
    </div>
  );
}
