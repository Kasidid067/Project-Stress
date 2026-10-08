export interface ProfileData {
  id: number;
  studentId: string;
  fullname: string;
  email: string;
  phone: string | null;
  role: string;
  major: {
    id: number;
    name: string;
  };
  advisor: {
    id: number;
    fullname: string;
    email: string;
    phone: string | null;
  } | null;
}
