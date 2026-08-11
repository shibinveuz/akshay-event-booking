import BadgeInstructions from "./BadgeInstructions";
import VisitorBadgePreview from "./VisitorBadgePreview";
import VisitorEventInfo from "./VisitorEventInfo";
import VisitorProfileDetails from "./VisitorProfileDetails";

export default function VisitorDetails({ visitor }) {
  return (
    <div className="tab-content" id="visitor">
      <div className="content-area">
        <div className="welcome-section">
          <h1 className="welcome-title">WELCOME, {visitor.firstName}</h1>

          <p className="welcome-text">
            Manage your event experience effortlessly – access your registration
            details, preview your badge, and personalise your profile for
            seamless matchmaking.
          </p>
        </div>

        <div className="event-info-section">
          <div className="event-info-grid">
            <VisitorBadgePreview visitor={visitor} />

            <VisitorEventInfo visitor={visitor} />
          </div>
        </div>

        <BadgeInstructions />

        <VisitorProfileDetails visitor={visitor} />
      </div>
    </div>
  );
}
