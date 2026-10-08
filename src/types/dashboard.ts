export interface DashboardData {
  fullname: string;
  studentId: string;
  major: string;
  role: string;

  latestStress: {
    stressScore: number;
    stressLevel: string;
  } | null;

  latestPulse: {
    bpm: number;
  } | null;
}
