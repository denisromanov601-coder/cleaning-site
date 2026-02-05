export interface UserApartment {
  building_code?: string;
  apartment_number?: number;
  role?: 'resident' | 'manager';
}

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  apartment?: {
    building_code: string;
    apartment_number: number;
    role: string;
  } | null;
  total_cleanings: number; // новое поле
}
