import SupportRequestQueue from "@/components/support-requests/SupportRequestQueue";

export default function AdminSupportRequestsPage() {
  return <SupportRequestQueue endpoint="/api/admin/support-requests" title="คำขอปรับข้อมูลนิสิต" />;
}
