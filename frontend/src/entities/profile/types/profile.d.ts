export interface Schedule {
  id: number;
  day_of_week: number;
  user_id: number | null;
  username?: string | null;
  is_taken: boolean;
}

export interface Task {
  id: number;
  user_id: number;
  day_of_week: number;
  name: string;
  is_done: boolean;
}