export const mockOfficer = {
  full_name: "Insp. Naidu",
  badge_id: "RN-2048",
  department: "Missing Persons Unit",
};

export const mockCases = [
  {
    case_id: "MC-1001",
    child_name: "Aarav Kumar",
    child_age: 10,
    gender: "Male",
    last_seen_location: "MG Road",
    last_seen_datetime: "2026-08-31T16:30:00",
    case_stage: "Open",
    filed_by: "Parent",
  },
  {
    case_id: "MC-1002",
    child_name: "Ananya Rao",
    child_age: 12,
    gender: "Female",
    last_seen_location: "Central Bus Station",
    last_seen_datetime: "2026-08-30T19:15:00",
    case_stage: "Investigating",
    filed_by: "Guardian",
  },
  {
    case_id: "MC-1003",
    child_name: "Rohan Singh",
    child_age: 9,
    gender: "Male",
    last_seen_location: "Kukatpally",
    last_seen_datetime: "2026-08-29T14:20:00",
    case_stage: "Matched",
    filed_by: "Parent",
  },
  {
    case_id: "MC-1004",
    child_name: "Diya Sharma",
    child_age: 11,
    gender: "Female",
    last_seen_location: "Secunderabad",
    last_seen_datetime: "2026-08-27T17:45:00",
    case_stage: "Resolved",
    filed_by: "Guardian",
  },
  {
    case_id: "MC-1005",
    child_name: "Kabir Reddy",
    child_age: 8,
    gender: "Male",
    last_seen_location: "Banjara Hills",
    last_seen_datetime: "2026-08-25T13:10:00",
    case_stage: "Closed",
    filed_by: "Parent",
  },
];

export const mockNotifications = [
  {
    id: 1,
    title: "New case assigned",
    message: "A new missing-child case requires review.",
    time: "10 min ago",
    type: "case",
  },
  {
    id: 2,
    title: "Sighting report received",
    message: "A public sighting has been submitted.",
    time: "32 min ago",
    type: "sighting",
  },
  {
    id: 3,
    title: "Case status updated",
    message: "A case has moved to the matched stage.",
    time: "1 hr ago",
    type: "update",
  },
];