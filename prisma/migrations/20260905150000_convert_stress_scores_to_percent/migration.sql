-- เปลี่ยนผลประเมินเดิมจากคะแนนรวม 0-15 เป็นเปอร์เซ็นต์ตามคะแนน ST-5 ดิบ
-- ชีพจรคงเป็นข้อมูลประกอบ ไม่ถูกใช้ลดหรือเพิ่มคะแนนความเครียด
UPDATE `StressResult` AS result
INNER JOIN `ST5Assessment` AS assessment ON assessment.`id` = result.`assessmentId`
SET
  result.`stressScore` = ROUND((assessment.`totalScore` / 15) * 100),
  result.`stressLevel` = CASE
    WHEN ROUND((assessment.`totalScore` / 15) * 100) <= 40 THEN 'LOW'
    WHEN ROUND((assessment.`totalScore` / 15) * 100) <= 70 THEN 'MEDIUM'
    ELSE 'HIGH'
  END;
