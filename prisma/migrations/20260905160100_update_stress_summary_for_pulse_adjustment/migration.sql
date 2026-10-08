-- อัปเดตข้อความสรุปผลเดิมให้แสดงการคำนวณ ST-5 + คะแนนเพิ่มจากชีพจร
UPDATE `StressResult` AS result
INNER JOIN `ST5Assessment` AS assessment ON assessment.`id` = result.`assessmentId`
LEFT JOIN `PulseRecord` AS pulse ON pulse.`id` = result.`pulseId`
SET result.`aiSummary` = CONCAT(
  'คะแนน ST-5 ', assessment.`totalScore`, '/15 คิดเป็น ', ROUND((assessment.`totalScore` / 15) * 100), '% ',
  'ชีพจร ', COALESCE(CAST(pulse.`bpm` AS CHAR), '-'), ' BPM (',
  CASE
    WHEN pulse.`bpm` < 50 THEN 'ชีพจรต่ำ'
    WHEN pulse.`bpm` <= 100 THEN 'ชีพจรอยู่ในเกณฑ์ปกติ'
    WHEN pulse.`bpm` <= 120 THEN 'ชีพจรค่อนข้างสูง'
    ELSE 'ชีพจรสูงผิดปกติ'
  END,
  ') เพิ่มคะแนนความเสี่ยง ',
  CASE WHEN pulse.`bpm` < 50 OR pulse.`bpm` > 120 THEN 30 WHEN pulse.`bpm` > 100 THEN 15 ELSE 0 END,
  '% ดังนั้นคะแนนรวม ', ROUND((assessment.`totalScore` / 15) * 100), '% + ',
  CASE WHEN pulse.`bpm` < 50 OR pulse.`bpm` > 120 THEN 30 WHEN pulse.`bpm` > 100 THEN 15 ELSE 0 END,
  '% = ', result.`stressScore`, '%'
);
