import VisitorPortalClient from "./VisitorPortalClient";

export default function VisitorPortal({ visitor, history = [] }) {
  if (!visitor) {
    return (
      <div className="text-center py-5">Visitor details not available.</div>
    );
  }

  return <VisitorPortalClient visitor={visitor} history={history} />;
}
