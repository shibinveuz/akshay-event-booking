export default function VisitorHeader({ visitor }) {
  const initials = [visitor.firstName, visitor.lastName]
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  const fullName = [visitor.firstName, visitor.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="visitor_topright">
      <div className="d-flex gap-2 align-items-center justify-content-end w-100">
        <div className="user-dropdown">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>

            <span className="user-name">{fullName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
