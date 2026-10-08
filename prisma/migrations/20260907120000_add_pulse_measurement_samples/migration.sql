-- เก็บค่า BPM ทั้ง 3 ครั้งจากเซ็นเซอร์ก่อนระบบคำนวณและบันทึกค่าเฉลี่ย
ALTER TABLE `PulseMeasurementSession`
  ADD COLUMN `samples` JSON NULL;
