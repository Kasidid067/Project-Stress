type ST5AnswerLike = {
  questionNo: number;
  score: number;
};

type ActivityLike = {
  category: string;
};

// หมวดกิจกรรมที่ช่วยดูแลอาการตามแต่ละข้อของ ST-5
const categoryPriorityByQuestion: Record<number, string[]> = {
  1: ["MEDITATION", "MUSIC", "RELAX"], // ปัญหาการนอน
  2: ["MEDITATION", "RELAX", "EXERCISE"], // สมาธิลดลง
  3: ["MEDITATION", "MUSIC", "EXERCISE"], // หงุดหงิด/กระวนกระวาย
  4: ["EXERCISE", "MUSIC", "OTHER"], // เบื่อหน่าย
  5: ["MUSIC", "RELAX", "OTHER"], // ไม่อยากพบปะผู้คน
};

const reasonByQuestion: Record<number, string> = {
  1: "นอนหลับไม่ดี",
  2: "สมาธิลดลง",
  3: "หงุดหงิดหรือกระวนกระวาย",
  4: "รู้สึกเบื่อหน่าย",
  5: "ไม่อยากพบปะผู้คน",
};

/**
 * เลือกกิจกรรมให้สอดคล้องกับคำตอบ ST-5 ที่มีความถี่ตั้งแต่ "บ่อยครั้ง"
 * (คะแนน 2 และ 3) และให้น้ำหนักคะแนน 3 ก่อนคะแนน 2
 */
export function recommendActivitiesFromST5<T extends ActivityLike>(
  activities: T[],
  answers: ST5AnswerLike[],
  fallbackActivities: T[] = activities
): T[] {
  const priority = new Map<string, number>();

  [...answers]
    .filter((answer) => answer.score >= 2)
    .sort((left, right) => right.score - left.score || left.questionNo - right.questionNo)
    .forEach((answer) => {
      for (const category of categoryPriorityByQuestion[answer.questionNo] ?? []) {
        if (!priority.has(category)) priority.set(category, priority.size);
      }
    });

  if (priority.size === 0) return fallbackActivities;

  const matched = activities.filter((activity) => priority.has(activity.category));
  if (matched.length === 0) return fallbackActivities;

  return matched.sort(
    (left, right) =>
      (priority.get(left.category) ?? Number.MAX_SAFE_INTEGER) -
      (priority.get(right.category) ?? Number.MAX_SAFE_INTEGER)
  );
}

/** ข้อความสั้น ๆ สำหรับอธิบายว่าเหตุใดจึงแนะนำกิจกรรมนี้ */
export function getActivityRecommendationReasons(
  activity: ActivityLike,
  answers: ST5AnswerLike[]
): string[] {
  return [...answers]
    .filter((answer) => answer.score >= 2)
    .sort((left, right) => right.score - left.score || left.questionNo - right.questionNo)
    .filter((answer) => categoryPriorityByQuestion[answer.questionNo]?.includes(activity.category))
    .map((answer) => reasonByQuestion[answer.questionNo])
    .filter((reason): reason is string => Boolean(reason));
}

export function addActivityRecommendationReasons<T extends ActivityLike>(
  activities: T[],
  answers: ST5AnswerLike[]
): (T & { recommendationReasons: string[] })[] {
  return activities.map((activity) => ({
    ...activity,
    recommendationReasons: getActivityRecommendationReasons(activity, answers),
  }));
}
