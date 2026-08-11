import Registration from "@/app/widgets/registration/Registration";

export const metadata = {
  title: "Registration | GITEX NIGERIA 2026",
  description: "Complete your registration for GITEX Nigeria 2026.",
};

const countries = [
  {
    value: "NG",
    label: "Nigeria",
    phoneCode: "+234",
  },
  {
    value: "IN",
    label: "India",
    phoneCode: "+91",
  },
  {
    value: "AE",
    label: "United Arab Emirates",
    phoneCode: "+971",
  },
  {
    value: "GB",
    label: "United Kingdom",
    phoneCode: "+44",
  },
  {
    value: "US",
    label: "United States",
    phoneCode: "+1",
  },
];

const selectedTicket = {
  id: 1,
  name: "TEST1",
  category: "VISITOR",
  price: 0,
  oldPrice: 0,
  currency: "NGN",
  vat: "Incl. 7.5% VAT",
  className: "ticket-bg-green",
};

export default function RegistrationPage() {
  return <Registration countries={countries} selectedTicket={selectedTicket} />;
}
