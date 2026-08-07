export const SECTIONS = {
  COLLECTIVE: "collective",
  MEMBER: "member",
};

export const SECTION_LABELS = {
  [SECTIONS.COLLECTIVE]: "Collective Events",
  [SECTIONS.MEMBER]: "Member Hosted Events",
};

export const CATEGORY_TAGS = [
  "Networking & Connection",
  "Business & Entrepreneurship",
  "Marketing & Visibility",
  "Leadership & Professional Development",
  "Mindset & Personal Growth",
  "Sales & Revenue",
  "Finance & Money",
  "Health & Wellness",
  "Technology & AI",
  "Productivity & Time Management",
  "Career & Workplace",
  "Community & Collaboration",
  "Education & Workshops",
  "Arts, Creativity & Culture",
  "Social & Celebrations",
  "Faith & Spirituality",
  "Nonprofit & Social Impact",
];

export const MAX_CATEGORY_TAGS = 3;
export const MAX_DESCRIPTION_WORDS = 100;

export const LOCATION_TYPES = {
  IN_PERSON: "in_person",
  VIRTUAL: "virtual",
};

// A practical set covering US time zones (the community's primary audience)
// plus a couple of common international ones. Values are IANA zone names.
export const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (New York)" },
  { value: "America/Chicago", label: "Central Time (Chicago)" },
  { value: "America/Denver", label: "Mountain Time (Denver)" },
  { value: "America/Phoenix", label: "Arizona (no DST, Phoenix)" },
  { value: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { value: "America/Anchorage", label: "Alaska Time (Anchorage)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (Honolulu)" },
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "UK Time (London)" },
];
