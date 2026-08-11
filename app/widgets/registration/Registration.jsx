import RegistrationForm from "./RegistrationForm";

export default function Registration({
  countries = [],
  selectedTicket = null,
}) {
  return (
    <div className="main-container">
      <div className="main-foreg-in">
        <RegistrationForm
          countries={countries}
          selectedTicket={selectedTicket}
        />
      </div>
    </div>
  );
}
