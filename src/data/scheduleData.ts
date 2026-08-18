export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  category: string;
  stage: string;
  day: string;
  status: 'Completed' | 'Live' | 'Upcoming';
  coordinator?: string;
  participants?: string | number | null;
}

export const DAYS_LIST = [
  'Tue 18/08 — Inauguration Day',
  'Wed 19/08 — Competitions Day',
  'Thu 20/08 — Competitions & Valedictory',
  'Pre-Fest (Completed)',
] as const;

// ==========================================
// DAY 1 — Tuesday 18/08/2026
// Inauguration + Primary Section Arts Fest
// Stage 1: KALAKELI (HARIHARAN MEMORIAL AUDITORIUM)
// ==========================================
export const SCHEDULE_DATA: ScheduleEvent[] = [
  // Opening Ceremony
  { id: 'd1-1', time: '9:00 AM', title: 'Prayer', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-2', time: '9:05 AM', title: 'Flag Hoisting', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-3', time: '9:10 AM', title: 'Curtain-Raiser (Pooja Dance — Primary)', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', coordinator: 'Anamika (VC) & Devana (VB)' },
  { id: 'd1-4', time: '9:20 AM', title: 'Welcome Address', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', coordinator: 'Dr. Pooja S (Principal)' },
  { id: 'd1-5', time: '9:30 AM', title: 'Presidential Address', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', coordinator: 'Sri. Unnikrishnan Vishakam (PTA President)' },
  { id: 'd1-6', time: '9:35 AM', title: 'Inaugural Address', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', coordinator: 'Master Devatheerth (Special Invitee — Finalist Topsinger Flowers Channel & Sa Re Ga Ma Pa, Zee Keralam)' },
  { id: 'd1-7', time: '9:45 AM', title: 'Honouring the Chief Guest', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', coordinator: 'Dr. P K Sukumaran (Trust Secretary)' },
  { id: 'd1-8', time: '9:50 AM', title: 'Vote of Thanks', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', coordinator: 'Master Adwaith Prasanth (Head Boy)' },
  { id: 'd1-9', time: '10:00 AM', title: 'Pooja Dance', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-10', time: '10:00 AM', title: '🎉 Primary Section Arts Fest Begins', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  // Primary Section Events
  { id: 'd1-11', time: '10:00 AM', title: 'Pooja Dance — Hazel Nasmal (IV A)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-12', time: '10:05 AM', title: 'Group Dance — Vipanjika & Team (Polika)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-13', time: '10:15 AM', title: 'STD I — Property Dance (6 Teams)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 6 },
  { id: 'd1-14', time: '11:00 AM', title: 'Classical Dance — Alga & Erisha (III STD)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 2 },
  { id: 'd1-15', time: '11:05 AM', title: 'STD II — Fusion Dance (7 Items)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 7 },
  { id: 'd1-16', time: '11:35 AM', title: 'English Skit (STD V)', category: 'Drama', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-17', time: '11:50 AM', title: 'Film Song — Nivedhya (III E) & Aradhya (IV B)', category: 'Music', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 2 },
  { id: 'd1-18', time: '11:55 AM', title: 'STD I — Fusion Dance (6 Items)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 6 },
  { id: 'd1-19', time: '12:40 PM', title: 'Song by Ashwika Reju (III G)', category: 'Music', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-20', time: '12:45 PM', title: 'Group Dance — Avanthika Sajith (IIIC) & Hema Prasad (V F)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 2 },
  { id: 'd1-21', time: '12:50 PM', title: 'Keyboard — Abhinand Krishnan M S (V F)', category: 'Instrumental', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-22', time: '12:55 PM', title: 'STD II — Theme Dance (7 Items)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 7 },
  { id: 'd1-lb', time: 'Lunch Break', title: 'LUNCH BREAK', category: 'Break', stage: '', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-23', time: '1:40 PM', title: 'Solo Dance — Devayani Vinod (V B)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-24', time: '1:45 PM', title: 'STD III — Fusion Dance (7 Items)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 7 },
  { id: 'd1-25', time: '2:20 PM', title: 'Folk Dance — Sreeveni (II C)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-26', time: '2:25 PM', title: 'Violin — Kasinath T M (V F)', category: 'Instrumental', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-27', time: '2:30 PM', title: 'Special Zumba Dance (Common Item)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-28', time: '2:45 PM', title: 'Theme Dance — "Rhythm for a Plastic-Free Earth" (GK Club — Common)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-29', time: '2:55 PM', title: 'Solo Song — Aadhinath V S (III C)', category: 'Music', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-30', time: '3:00 PM', title: 'Fancy Dress Competition (Kids Category — 12 Nos)', category: 'Drama', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 12 },
  { id: 'd1-31', time: '3:30 PM', title: 'STD III — Fusion Dance (7 Items)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 7 },
  { id: 'd1-32', time: '4:05 PM', title: 'Film Song — Anikha Maneesh (III B) & Aditi Ajith (III G)', category: 'Music', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 2 },
  { id: 'd1-33', time: '4:10 PM', title: 'Solo Dance — Evyavan D R (I E)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-34', time: '4:15 PM', title: 'Karoke Song — Dyan Vishnu Gopan (II D)', category: 'Music', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-35', time: '4:20 PM', title: 'Solo Dance — Adwika Arun (IV A)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-36', time: '4:25 PM', title: 'STD IV — Fusion Dance (6 Items)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 6 },
  { id: 'd1-37', time: '5:00 PM', title: 'Keyboard — Sathvik S (V F)', category: 'Instrumental', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-38', time: '5:05 PM', title: 'Dance — Nehal and Team (Common Item)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
  { id: 'd1-39', time: '5:10 PM', title: 'Solo Dance — Anha Mariyam (II D)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-40', time: '5:15 PM', title: 'Keyboard — Ihan Sanoj (V B)', category: 'Instrumental', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 1 },
  { id: 'd1-41', time: '5:20 PM', title: 'Film Song — Antonio Johns Munddakkal (VB) & Aadhinath V S (III C)', category: 'Music', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 2 },
  { id: 'd1-42', time: '5:25 PM', title: 'STD V — Fusion Dance (6 Items)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming', participants: 6 },
  { id: 'd1-43', time: '6:00 PM', title: 'National Anthem', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Tue 18/08 — Inauguration Day', status: 'Upcoming' },
];

// ==========================================
// ==========================================
// ==========================================
// DAY 2 — Wednesday 19/08/2026
// Stage 1: KALAKELI (HARIHARAN MEMORIAL AUDITORIUM)
// ==========================================
export const DAY2_SCHEDULE_DATA: ScheduleEvent[] = [
  { id: 'd2-1', time: '9:00 AM', title: 'Welcome Dance', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-2', time: '9:05 AM', title: 'Arabic Dance — Std XI Girls', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-3', time: '9:15 AM', title: 'Folk Dance Competition — (STATES OF INDIA) Std III (HOUSE WISE)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming', participants: 'House Wise' },
  { id: 'd2-4', time: '10:00 AM', title: 'Kaikottikali — Std XI (Team 1)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-5', time: '10:10 AM', title: 'Dance Competition — (HOUSE WISE THEMATIC DANCE Std IV)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming', participants: 'House Wise' },
  { id: 'd2-6', time: '10:50 AM', title: 'Mime — Std XI Girls', category: 'Drama', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-7', time: '11:00 AM', title: 'Dance Competition — (KAIKOTTIKALI) Std V', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-8', time: '11:40 AM', title: 'House-Wise Thiruvathira Competition (CATEGORY 3)', category: 'House Item', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming', participants: 4 },
  { id: 'd2-9', time: '12:15 PM', title: 'Kaikottikali — Std XI (Team 2)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-lb', time: '12:30 PM', title: 'LUNCH BREAK', category: 'Break', stage: '', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-10', time: '1:00 PM', title: 'House-Wise Group Dance Competition (CATEGORY 2)', category: 'House Item', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming', participants: 4 },
  { id: 'd2-11', time: '1:40 PM', title: 'Entertainment Programme — Std XII Girls (Team 1)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-12', time: '2:00 PM', title: 'House-Wise Oppana Competition (CATEGORY 3)', category: 'House Item', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming', participants: 4 },
  { id: 'd2-13', time: '2:40 PM', title: 'Entertainment Programme — Std XII Girls (Team 2)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-14', time: '3:00 PM', title: 'House-Wise Fusion Dance (Boys) Competition (CATEGORY 2)', category: 'House Item', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming', participants: 4 },
  { id: 'd2-15', time: '3:40 PM', title: 'Entertainment Programme — Std XII Girls (Team 3)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
  { id: 'd2-16', time: '4:00 PM', title: 'House-Wise Kaikottikali Competition (CATEGORY 2)', category: 'House Item', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming', participants: 4 },
  { id: 'd2-17', time: '4:40 PM', title: 'National Anthem', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Wed 19/08 — Competitions Day', status: 'Upcoming' },
];

// ==========================================
// DAY 3 — Thursday 20/08/2026
// Stage 1: KALAKELI (HARIHARAN MEMORIAL AUDITORIUM)
// ==========================================
export const DAY3_SCHEDULE_DATA: ScheduleEvent[] = [
  { id: 'd3-1', time: '9:00 AM', title: 'Entertainment Programme — XII D Boys', category: 'Drama', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
  { id: 'd3-2', time: '9:15 AM', title: 'Keyboard (An Entertainment Item)', category: 'Instrumental', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
  { id: 'd3-3', time: '9:20 AM', title: 'Mime Competition — Category 3', category: 'Drama', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
  { id: 'd3-4', time: '9:40 AM', title: 'Entertainment Programme — (Fusion Dance) XII A Boys', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
  { id: 'd3-5', time: '10:00 AM', title: 'Mime Competition — Category 2', category: 'Drama', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
  { id: 'd3-6', time: '10:20 AM', title: 'Entertainment Programme — (Fusion Dance) XII B Boys', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
  { id: 'd3-7', time: '10:40 AM', title: 'House-Wise One Act Play Competition (Common Event)', category: 'House Item', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming', participants: 4 },
  { id: 'd3-8', time: '12:00 PM', title: 'Entertainment Programme — (Fusion Dance) XII C Boys', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
  { id: 'd3-lb', time: '12:20 PM', title: 'LUNCH BREAK', category: 'Break', stage: '', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
  { id: 'd3-val', time: '2:00 PM', title: 'Valedictory Function', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Thu 20/08 — Competitions & Valedictory', status: 'Upcoming' },
];

// ==========================================
// PRE-FEST COMPLETED EVENTS
// ==========================================
export const PREFEST_SCHEDULE_DATA: ScheduleEvent[] = [
  { id: 's-comp-1', time: 'Completed Pre-Fest', title: 'Pencil Drawing', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-2', time: 'Completed Pre-Fest', title: 'Water Colour Painting', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-3', time: 'Completed Pre-Fest', title: 'Crayon Painting', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-4', time: 'Completed Pre-Fest', title: 'Oil Colour Painting', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-5', time: 'Completed Pre-Fest', title: 'Cartoon', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-6', time: 'Completed Pre-Fest', title: 'Poster Making', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-7', time: 'Completed Pre-Fest', title: 'Collage', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-8', time: 'Completed Pre-Fest', title: 'English Essay Writing, Story Writing & Versification', category: 'English Literary', stage: 'Literary Hall', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-9', time: 'Completed Pre-Fest', title: 'Malayalam Essay Writing, Story Writing & Versification', category: 'Malayalam Literary', stage: 'Literary Hall', day: 'Pre-Fest (Completed)', status: 'Completed' },
];

// ==========================================
// COMBINED SCHEDULE (all days)
// ==========================================
export const ALL_SCHEDULE_DATA: ScheduleEvent[] = [
  ...SCHEDULE_DATA,
  ...DAY2_SCHEDULE_DATA,
  ...DAY3_SCHEDULE_DATA,
  ...PREFEST_SCHEDULE_DATA,
];

// ==========================================
// DATE MAP — maps IST calendar date to day key
// ==========================================
export const DAY_DATE_MAP: Record<string, string> = {
  '2026-08-18': 'Tue 18/08 — Inauguration Day',
  '2026-08-19': 'Wed 19/08 — Competitions Day',
  '2026-08-20': 'Thu 20/08 — Competitions & Valedictory',
};
