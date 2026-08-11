import HeaderControls from "./HeaderControls";

export default function SubHeader({ isAuthenticated = false }) {
  return (
    <div className="top-header-second-out">
      <div className="width-container">
        <HeaderControls isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}
