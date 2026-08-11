import VisitorPortal from "@/app/widgets/visitor/VisitorPortal";

export const metadata = {
  title: "Visitor Portal | GITEX NIGERIA 2026",
  description: "Manage your GITEX Nigeria registration and visitor details.",
};

const visitorData = {
  id: 1,

  firstName: "Mohammed",
  lastName: "Navab",

  email: "mnavab@gmail.com",

  phoneCode: "971",
  mobile: "521234567",

  country: "United Arab Emirates",
  nationality: "United Arab Emirates",

  company: "Info tech",
  jobTitle: "CEO",

  companyType: "Agency",
  industry: "Food & Beverages",
  investorType: "Seed Funds",

  badgeCategory: "VISITOR",

  ticket: {
    id: 1,
    name: "VIP Pass",
  },

  events: [
    {
      id: 1,
      date: "7 SEPT 2026",
      time: "10.00 AM - 6.00 PM",
      location: "Abuja, Nigeria",
      locationUrl: "#",
    },
    {
      id: 2,
      date: "7 SEPT 2026",
      time: "10.00 AM - 6.00 PM",
      location: "Eko Hotel, Lagos",
      locationUrl: "#",
    },
  ],

  interests: ["Bakery, Cakes & Desserts", "Beverages", "Chilled & Fresh Food"],
};

const userHistory = [
  {
    id: 1,
    date: "24/06/2026 10:32 AM",
    user: "Mariya John",
    image: "/assets/img/user-1.jpg",
    activity: "Login",
    description: "User logged in successfully",
    performedBy: "Maria John",
    performedByType: "Primary",
    status: "Success",
    ipAddress: "192.168.1.10",
  },
  {
    id: 2,
    date: "23/06/2026 04:15 PM",
    user: "Mohammed Navab",
    image: "/assets/img/user-2.jpg",
    activity: "Ticket Upgrade",
    description: "Upgraded to Premium Ticket",
    performedBy: "Admin",
    status: "Success",
    ipAddress: "192.168.1.11",
  },
  {
    id: 3,
    date: "22/06/2026 09:00 AM",
    user: "Nabeel Mohammed",
    image: "/assets/img/user-3.jpeg",
    activity: "Profile Update",
    description: "Changed email address",
    performedBy: "Self",
    status: "Failed",
    ipAddress: "192.168.1.12",
  },
];

export default function VisitorPortalPage() {
  return <VisitorPortal visitor={visitorData} history={userHistory} />;
}
