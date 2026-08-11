import Confirmation from "@/app/widgets/confirmation/Confirmation";

export const metadata = {
  title: "Registration Confirmation | GITEX NIGERIA 2026",
  description: "Your GITEX Nigeria registration confirmation.",
};

const dummyConfirmation = {
  firstName: "Mohammed",
  lastName: "Ahmed",
  jobTitle: "Software Engineer",
  company: "Example Company",
  country: "Nigeria",
  badgeCategory: "VISITOR",

  event: {
    date: "07-10 September 2026",
    locationLabel: "Location",
    locationUrl: "#",
    calendarUrl: "#",
  },

  confirmationEmailUrl: "#",
  newRegistrationUrl: "/",
  visaUrl: "#",
};

export default function ConfirmationPage() {
  return <Confirmation data={dummyConfirmation} />;
}
