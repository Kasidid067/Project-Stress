import { EditUserPage } from "@/app/admin/users/[id]/page";

export default function EditStaffPage() {
  return <EditUserPage expectedRole="STAFF" />;
}
