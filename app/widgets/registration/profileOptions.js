// These are the authoritative option contracts used by the GITEX Nigeria
// registration application. Company Type uses label/value, while Industry
// intentionally uses name/code.
export const COMPANY_TYPE_OPTIONS = [
  "Corporation",
  "Limited Liability Company",
  "Professional Limited Liability Company",
  "Professional Corporation",
  "Limited Liability Partnership",
  "Limited Partnership",
  "Sole Proprietorship",
  "Joint Venture",
  "Non-Governmental Organization",
  "Non-Profit Organization",
  "Government Entity",
  "Educational Institution",
  "Public Company",
  "Private Company",
  "Cooperative",
  "Banking Institution",
  "Insurance Company",
  "Media Company",
  "Technology Company",
  "Retail Business",
  "Manufacturing Company",
  "Service Provider",
  "Freelancer/Self-employed",
]
  .map((value) => ({ label: value, value }))
  .sort((first, second) => first.label.localeCompare(second.label));

export const INDUSTRY_OPTIONS = [
  "Agriculture",
  "Automotive",
  "Aviation & Space",
  "Banking, Finance & Insurance",
  "Construction & Infrastructure",
  "Cosmetics",
  "Defense",
  "Education",
  "Energy & Utilities",
  "Entertainment",
  "Environment & Sustainability",
  "Fashion & Apparel",
  "FMCG",
  "Gaming",
  "General Trading",
  "Government",
  "Healthcare",
  "Hospitality",
  "Jewellery & Luxury Goods",
  "Legal",
  "Logistics & Supply Chain",
  "Manufacturing",
  "Media & Advertising",
  "Mining",
  "Real Estate & Property Developers",
  "Research & Development",
  "Retail",
  "Technology",
  "Telecoms",
  "Travel & Tourism",
].map((name) => ({ name, code: name }));

export const INVESTOR_OPTIONS = ["Yes", "No"].map((value) => ({
  label: value,
  value,
}));
