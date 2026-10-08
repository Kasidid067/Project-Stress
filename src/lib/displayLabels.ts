export function stressLevelLabel(level?: string | null) {
  switch (level) {
    case "LOW": return "ต่ำ";
    case "MEDIUM": return "ปานกลาง";
    case "HIGH": return "สูง";
    default: return "-";
  }
}

export function activityCategoryLabel(category?: string | null) {
  switch (category) {
    case "RELAX": return "ผ่อนคลาย";
    case "EXERCISE": return "ออกกำลังกาย";
    case "MEDITATION": return "ทำสมาธิ";
    case "MUSIC": return "ฟังเพลง";
    case "OTHER": return "อื่น ๆ";
    default: return "-";
  }
}

export function roleLabel(role?: string | null) {
  switch (role) {
    case "STUDENT": return "นิสิต";
    case "ADVISOR": return "อาจารย์ที่ปรึกษา";
    case "STAFF": return "เจ้าหน้าที่";
    case "ADMIN": return "ผู้ดูแลระบบ";
    default: return "ผู้ใช้งาน";
  }
}

export function userStatusLabel(status?: string | null) {
  switch (status) {
    case "ACTIVE": return "ใช้งาน";
    case "INACTIVE": return "ระงับการใช้งาน";
    default: return "-";
  }
}
