-- คำนวณผลเดิมใหม่: ST-5 เป็นเปอร์เซ็นต์ และชีพจรเพิ่มคะแนนความเสี่ยงได้สูงสุด 30%
UPDATE `StressResult` AS result
INNER JOIN `ST5Assessment` AS assessment ON assessment.`id` = result.`assessmentId`
LEFT JOIN `PulseRecord` AS pulse ON pulse.`id` = result.`pulseId`
SET
  result.`stressScore` = LEAST(
    100,
    ROUND((assessment.`totalScore` / 15) * 100) +
    CASE
      WHEN pulse.`bpm` < 50 OR pulse.`bpm` > 120 THEN 30
      WHEN pulse.`bpm` > 100 THEN 15
      ELSE 0
    END
  ),
  result.`stressLevel` = CASE
    WHEN LEAST(100, ROUND((assessment.`totalScore` / 15) * 100) + CASE WHEN pulse.`bpm` < 50 OR pulse.`bpm` > 120 THEN 30 WHEN pulse.`bpm` > 100 THEN 15 ELSE 0 END) <= 40 THEN 'LOW'
    WHEN LEAST(100, ROUND((assessment.`totalScore` / 15) * 100) + CASE WHEN pulse.`bpm` < 50 OR pulse.`bpm` > 120 THEN 30 WHEN pulse.`bpm` > 100 THEN 15 ELSE 0 END) <= 70 THEN 'MEDIUM'
    ELSE 'HIGH'
  END;
