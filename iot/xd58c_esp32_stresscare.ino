/*
  StressCare + ESP32 + XD-58C

  การต่อสาย (สำคัญ: จ่าย XD-58C ด้วย 3.3V เมื่อใช้กับ ESP32)
    XD-58C + / VCC  -> 3V3 ของ ESP32
    XD-58C - / GND  -> GND ของ ESP32
    XD-58C S        -> GPIO34 ของ ESP32 (ADC)
    OLED SDA        -> GPIO21 ของ ESP32
    OLED SCL        -> GPIO22 ของ ESP32

  ติดตั้งไลบรารีจาก Arduino IDE > Library Manager:
    - PulseSensor Playground
    - Adafruit GFX Library
    - Adafruit SSD1306
    - ArduinoJson

  ต้องแก้ 4 ค่า: API_URL, COMMAND_URL, HEARTBEAT_URL และ SENSOR_API_KEY
  API_URL ต้องเป็น IP ของเครื่องที่รัน StressCare ไม่ใช่ localhost

  วิธีใช้บอร์ดร่วมกันหลายคน:
    1. นิสิตเข้าสู่ระบบแล้วกด "เริ่มวัดชีพจร" บนเว็บ
    2. บอร์ดจะดึงคำสั่งจาก COMMAND_URL ทุก 2 วินาที
    3. เมื่อหน้าจอ OLED ขึ้น "Hold still 7 sec" ให้วางนิ้วบน XD-58C และอยู่นิ่ง ๆ
    4. บอร์ดเก็บ BPM ที่ใช้ได้ 3 ค่าเป็นเวลาอย่างน้อย 7 วินาที แล้วส่งค่าเฉลี่ยกลับด้วยรหัสชั่วคราว
       ระบบจึงบันทึกให้ผู้กดปุ่มเพียง 1 ค่า
  จึงไม่ต้องตั้งค่า STUDENT_ID ในบอร์ด
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <PulseSensorPlayground.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const char* WIFI_SSID = "c4";
const char* WIFI_PASSWORD = "12345678";

// เปลี่ยน IP นี้เมื่อเครื่องที่รัน StressCare เปลี่ยนเครือข่าย
const char* API_URL ="http://miscis.scidi.tsu.ac.th:3067/api/sensor/pulse";
const char* COMMAND_URL ="http://miscis.scidi.tsu.ac.th:3067/api/sensor/pulse/command";
const char* HEARTBEAT_URL ="http://miscis.scidi.tsu.ac.th:3067/api/sensor/pulse/heartbeat";
const char* SENSOR_API_KEY = "a5d557c7cef2662d472726a605c6d072e9d048a6299ef25013186d17ac665c7c";

const int PULSE_PIN = 34;
const int OLED_SDA_PIN = 21;
const int OLED_SCL_PIN = 22;
const int OLED_WIDTH = 128;
const int OLED_HEIGHT = 64;
const int OLED_ADDRESS = 0x3C;
const unsigned long COMMAND_INTERVAL_MS = 2000;
const unsigned long RAW_LOG_INTERVAL_MS = 100;
// วัดแยกเป็น 3 รอบ รอบละ 7 วินาที เพื่อให้ผู้ใช้มีเวลาวางนิ้วให้นิ่งก่อนเก็บแต่ละค่า
const unsigned long SAMPLE_DURATION_MS = 7000;
const int REQUIRED_SAMPLE_COUNT = 3;
const int MIN_VALID_BPM = 40;
const int MAX_VALID_BPM = 180;

PulseSensorPlayground pulseSensor;
Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, -1);
unsigned long lastCommandCheckAt = 0;
unsigned long lastRawLogAt = 0;
String measurementToken = "";
bool oledReady = false;
unsigned long measurementStartedAt = 0;
unsigned long sampleWindowStartedAt = 0;
int sampleTotal = 0;
int sampleCount = 0;
int samples[REQUIRED_SAMPLE_COUNT] = { 0 };

void resetMeasurementSamples() {
  measurementStartedAt = millis();
  sampleWindowStartedAt = millis();
  sampleTotal = 0;
  sampleCount = 0;
  for (int index = 0; index < REQUIRED_SAMPLE_COUNT; index++) {
    samples[index] = 0;
  }
}

void showDisplay(const char* status, int bpm = 0) {
  if (!oledReady) return;
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println("StressCare");
  display.drawLine(0, 12, OLED_WIDTH, 12, SSD1306_WHITE);
  display.setCursor(0, 20);
  display.println(status);
  display.setTextSize(3);
  display.setCursor(0, 37);
  if (bpm > 0) {
    display.print(bpm);
    display.setTextSize(1);
    display.print(" BPM");
  } else {
    display.setTextSize(1);
    display.println("Place finger on sensor");
  }
  display.display();
}

void scanI2C() {
  Serial.println("เริ่มสแกนอุปกรณ์ I2C...");
  int found = 0;
  for (int address = 1; address < 127; address++) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.printf("พบ I2C ที่ 0x%02X\n", address);
      found++;
    }
  }
  if (found == 0) Serial.println("ไม่พบ I2C: ตรวจสาย OLED VCC, GND, SDA และ SCL");
}

void initializeDisplay() {
  scanI2C();
  oledReady = display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDRESS);
  if (!oledReady) {
    // OLED บางรุ่นใช้ 0x3D แทน 0x3C
    oledReady = display.begin(SSD1306_SWITCHCAPVCC, 0x3D);
  }
  if (!oledReady) {
    Serial.println("ไม่พบ OLED: ตรวจสาย SDA=21, SCL=22 และ I2C address 0x3C/0x3D");
    return;
  }
  display.clearDisplay();
  display.display();
  showDisplay("Starting...");
}

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("กำลังเชื่อม Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    showDisplay("Connecting WiFi...");
  }
  Serial.println();
  Serial.print("เชื่อมต่อแล้ว IP: ");
  Serial.println(WiFi.localIP());
  showDisplay("WiFi connected");
}

bool sendBpmToStressCare(int bpm) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-sensor-api-key", SENSOR_API_KEY);

  String payload = "{\"measurementToken\":\"" + measurementToken
    + "\",\"bpm\":" + String(bpm) + ",\"samples\":[";
  for (int index = 0; index < REQUIRED_SAMPLE_COUNT; index++) {
    if (index > 0) payload += ",";
    payload += String(samples[index]);
  }
  payload += "]}";
  const int statusCode = http.POST(payload);
  Serial.printf("ส่ง BPM %d, HTTP %d\n", bpm, statusCode);
  if (statusCode > 0) {
    Serial.println(http.getString());
  }
  const bool saved = statusCode >= 200 && statusCode < 300;
  // หากเครือข่ายตัดหลังเซิร์ฟเวอร์บันทึกสำเร็จ บอร์ดอาจได้รับ 409 เมื่อส่งซ้ำ
  // ให้ล้างคำสั่งนี้ด้วย เพื่อไม่ให้บอร์ดค้างกับคิวเดิม
  const bool requestExpired = statusCode == 409;
  showDisplay(saved ? "Saved to system" : requestExpired ? "Request expired" : "Send failed", bpm);
  http.end();
  return saved || requestExpired;
}

void sendMeasurementProgress(int bpm) {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-sensor-api-key", SENSOR_API_KEY);

  String payload = "{\"measurementToken\":\"" + measurementToken
    + "\",\"bpm\":" + String(bpm) + ",\"samples\":[";
  for (int index = 0; index < sampleCount; index++) {
    if (index > 0) payload += ",";
    payload += String(samples[index]);
  }
  payload += "]}";

  const int statusCode = http.POST(payload);
  Serial.printf("ส่งความคืบหน้า %d/%d, HTTP %d\n", sampleCount, REQUIRED_SAMPLE_COUNT, statusCode);
  if (statusCode > 0 && (statusCode < 200 || statusCode >= 300)) {
    // แสดงสาเหตุจาก API ใน Serial Monitor เฉพาะเมื่อส่งไม่สำเร็จ เพื่อช่วยตรวจสอบการเชื่อมต่อ
    Serial.println(http.getString());
  }
  http.end();
}

// ระหว่างที่กำลังเก็บตัวอย่าง BPM บอร์ดไม่ควรดึงคิวใหม่
// แต่ยังต้องส่งสัญญาณว่าอุปกรณ์ออนไลน์อยู่ เพื่อให้หน้าเว็บไม่แสดงว่าออฟไลน์
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();

  HTTPClient http;
  http.begin(HEARTBEAT_URL);
  http.addHeader("x-sensor-api-key", SENSOR_API_KEY);
  const int statusCode = http.GET();
  if (statusCode != 200) {
    Serial.printf("ส่งสถานะอุปกรณ์ไม่สำเร็จ HTTP %d\n", statusCode);
  }
  http.end();
}

void pollForMeasurementCommand() {
  if (WiFi.status() != WL_CONNECTED) connectWiFi();

  // กำลังวัดอยู่: ส่งเพียง heartbeat เพื่อไม่รับงานใหม่ทับคิวเดิม
  if (measurementToken.length() > 0) {
    sendHeartbeat();
    return;
  }

  HTTPClient http;
  http.begin(COMMAND_URL);
  http.addHeader("x-sensor-api-key", SENSOR_API_KEY);
  const int statusCode = http.GET();
  if (statusCode == 200) {
    Serial.println("เชื่อมต่อ API คำสั่งวัดสำเร็จ (HTTP 200)");
    JsonDocument document;
    const DeserializationError error = deserializeJson(document, http.getString());
    const char* token = !error ? document["command"]["token"] | "" : "";
    if (String(token).length() > 0) {
      measurementToken = token;
      resetMeasurementSamples();
      Serial.println("ได้รับคำสั่งวัดจากเว็บ");
      showDisplay("Hold still 7 sec");
    } else {
      Serial.println("ยังไม่มีคำสั่งวัดจากหน้าเว็บ");
    }
  } else if (statusCode > 0) {
    Serial.printf("รับคำสั่งวัดไม่สำเร็จ HTTP %d\n", statusCode);
  }
  http.end();
}

void setup() {
  Serial.begin(115200);

  Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);
  initializeDisplay();

  // ทำให้ ESP32 อ่าน ADC เป็นช่วง 0-1023 เพื่อใช้ threshold 550 ได้ง่าย
  analogReadResolution(10);
  pulseSensor.analogInput(PULSE_PIN);
  pulseSensor.setThreshold(550);

  if (!pulseSensor.begin()) {
    Serial.println("เริ่ม PulseSensor ไม่สำเร็จ: ตรวจสาย VCC, GND และ S");
    showDisplay("Sensor error");
  }

  connectWiFi();
}

void loop() {
  if (millis() - lastCommandCheckAt >= COMMAND_INTERVAL_MS) {
    lastCommandCheckAt = millis();
    pollForMeasurementCommand();
  }

  // เปิด Serial Plotter ที่ 115200 แล้ววางนิ้วบน XD-58C
  // ค่านี้ควรแกว่งตามชีพจร หากนิ่งที่ 0/1023 ให้ตรวจสาย S, VCC และ GND
  if (millis() - lastRawLogAt >= RAW_LOG_INTERVAL_MS) {
    lastRawLogAt = millis();
    Serial.printf("ADC:%d\n", analogRead(PULSE_PIN));
  }

  // Library จะประมวลผลสัญญาณอนาล็อกและบอกเมื่อพบหนึ่งจังหวะการเต้น
  if (pulseSensor.sawStartOfBeat()) {
    const int bpm = pulseSensor.getBeatsPerMinute();
    Serial.printf("BPM: %d\n", bpm);
    showDisplay(measurementToken.length() > 0 ? "Collecting samples" : "Ready - use website", bpm);

    const bool isValid = bpm >= MIN_VALID_BPM && bpm <= MAX_VALID_BPM;
    if (isValid && measurementToken.length() > 0) {
      // แต่ละค่าเป็นการวัดคนละรอบ: รอให้นิ่งครบ 7 วินาทีก่อนเก็บ BPM หนึ่งค่า
      const bool sampleWindowComplete = millis() - sampleWindowStartedAt >= SAMPLE_DURATION_MS;
      if (sampleCount < REQUIRED_SAMPLE_COUNT && sampleWindowComplete) {
        sampleTotal += bpm;
        samples[sampleCount] = bpm;
        sampleCount++;
        Serial.printf("เก็บค่า %d/%d: %d BPM\n", sampleCount, REQUIRED_SAMPLE_COUNT, bpm);
        showDisplay("Collecting samples", bpm);
        if (sampleCount < REQUIRED_SAMPLE_COUNT) {
          sendMeasurementProgress(bpm);
          // เริ่มนับ 7 วินาทีใหม่สำหรับการวัดครั้งถัดไป
          sampleWindowStartedAt = millis();
          showDisplay("Next sample 7 sec");
        }
      }

      if (sampleCount == REQUIRED_SAMPLE_COUNT) {
        const int averageBpm = (sampleTotal + (REQUIRED_SAMPLE_COUNT / 2)) / REQUIRED_SAMPLE_COUNT;
        Serial.printf("ครบ %d ค่าในอย่างน้อย 7 วินาที, ค่าเฉลี่ย: %d BPM\n", REQUIRED_SAMPLE_COUNT, averageBpm);
        showDisplay("Sending average", averageBpm);
        if (sendBpmToStressCare(averageBpm)) {
        measurementToken = "";
        resetMeasurementSamples();
        showDisplay("Ready - use website");
        }
      }
    }
  }

  delay(2);
}
