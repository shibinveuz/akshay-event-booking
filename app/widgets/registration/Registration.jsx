import RegistrationForm from "./RegistrationForm";

export default function Registration({
  countries = [],
  selectedTicket = null,
  interestOptions = [],
}) {
  if (!selectedTicket) {
    return (
      <div className="main-container text-center py-5">
        The selected ticket is unavailable. Please choose another ticket.
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="main-foreg-in">
        <RegistrationForm
          countries={countries}
          selectedTicket={selectedTicket}
          interestOptions={interestOptions}
        />
      </div>
    </div>
  );
}
