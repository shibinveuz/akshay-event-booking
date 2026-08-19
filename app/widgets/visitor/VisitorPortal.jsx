import VisitorPortalClient from "./VisitorPortalClient";

export default function VisitorPortal({ visitor }) {
  if (!visitor) {
    return (
      <div className="text-center py-5">Visitor details not available.</div>
    );
  }

  return <VisitorPortalClient visitor={visitor} />;
}
