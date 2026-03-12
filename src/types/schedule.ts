export type ScheduleEntryType = 'availability' | 'vacation' | 'sick_leave' | 'holiday';

export interface ScheduleEntry {
  id: string;
  staff_member_id: string;
  date: string; // YYYY-MM-DD
  entry_type: ScheduleEntryType;
  start_time: string | null; // HH:MM, only for availability
  end_time: string | null;   // HH:MM, only for availability
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export interface StaffMember {
  id: string;
  name: string;
  location_id: string;
  section: string;
  avatar_url: string | null;
  active: boolean;
  user_id: string | null;
  created_at: string;
}
