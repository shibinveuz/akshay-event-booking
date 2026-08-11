import BadgePreview from "./BadgePreview";
import WelcomeSection from "./WelcomeSection";
import EventInfoSection from "./EventInfoSection";
import BadgeInstructions from "./BadgeInstructions";

export default function Confirmation({ data }) {
  if (!data) {
    return (
      <div className="main-container">
        <div className="text-center py-5">
          Confirmation details not available.
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="main-badge-wrapper">
        <div className="main-badge-wrapper-left">
          <div className="form-right-col">
            <BadgePreview data={data} />
          </div>
        </div>

        <div className="main-badge-wrapper-right">
          <div className="content-area">
            <WelcomeSection data={data} />

            <EventInfoSection data={data} />

            <BadgeInstructions />
          </div>
        </div>
      </div>
    </div>
  );
}
