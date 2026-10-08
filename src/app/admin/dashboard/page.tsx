"use client";

import {
  Users,
  GraduationCap,
  UserCheck,
  Briefcase,
} from "lucide-react";

import WelcomeCard from "@/components/dashboard/WelcomeCard";
import SummaryCard from "@/components/dashboard/SummaryCard";
import StressPieChart from "@/components/dashboard/StressPieChart";
import MonthlyChart from "@/components/dashboard/MonthlyChart";
import RecentAssessmentTable from "@/components/dashboard/RecentAssessmentTable";

import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import HighStressStudents from "@/components/dashboard/HighStressStudents";
import RecommendedActivities from "@/components/dashboard/RecommendedActivities";

export default function AdminDashboardPage() {

  const {
    dashboard,
    loading,
  } = useAdminDashboard();
  
  if (loading || !dashboard) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-[var(--content-muted)]">
        กำลังโหลด...
      </div>
    );
  }

  return (

    <main className="admin-page wellness-page space-y-8">

      <WelcomeCard
        fullname="ผู้ดูแลระบบ"
      />

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="ผู้ใช้ทั้งหมด"
          value={dashboard.totalUsers}
          icon={<Users size={32} />}
          color="bg-blue-600"
        />
        <SummaryCard
          title="นิสิต"
          value={dashboard.totalStudents}
          icon={<GraduationCap size={32} />}
          color="bg-green-600"
        />
        <SummaryCard
          title="อาจารย์"
          value={dashboard.totalAdvisors}
          icon={<UserCheck size={32} />}
          color="bg-yellow-500"
        />
        <SummaryCard
          title="เจ้าหน้าที่"
          value={dashboard.totalStaff}
          icon={<Briefcase size={32} />}
          color="bg-red-500"
        />
      </div>

      {/* PIE + TABLE */}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-4">
          <StressPieChart
            low={dashboard.lowStress}
            medium={dashboard.mediumStress}
            high={dashboard.highStress}
          />
        </div>

        <div className="col-span-12 xl:col-span-8">
          <RecentAssessmentTable />
        </div>
      </div>

      {/* MONTHLY */}

      <MonthlyChart
        data={dashboard.monthlyAssessments}
      />

      <div className="grid grid-cols-12 gap-6">
        <div
          className="col-span-12 xl:col-span-5"
        >
          <HighStressStudents
            students={
              dashboard.highStressStudents
            }
          />
        </div>
        <div
          className="col-span-12 xl:col-span-7"
        >
          <RecommendedActivities
            activities={
              dashboard.recommendedActivities
            }
          />
        </div>
      </div>

    </main>

  );

}
