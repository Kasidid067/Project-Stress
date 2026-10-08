import SupportRequestQueue from "@/components/support-requests/SupportRequestQueue";

export default function StaffSupportRequestsPage() {
  return <SupportRequestQueue endpoint="/api/staff/support-requests" title="คำขอจากนิสิต" />;
}
