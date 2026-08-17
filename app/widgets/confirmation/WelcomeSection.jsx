export default function WelcomeSection({ data }) {
  console.log("WelcomeSection data:", data);
  return (
    <div className="welcome-section">
      <h1 className="welcome-title">
        WELCOME, {data.firstName} {data.lastName || "Guest"}
      </h1>

      <p className="m-0">
        You have successfully registered and will receive your badge a week
        before the show.
      </p>

      <p className="welcome-text">
        Manage your event experience effortlessly – access your registration
        details, preview your badge, and personalise your profile for seamless
        matchmaking.
      </p>
    </div>
  );
}
