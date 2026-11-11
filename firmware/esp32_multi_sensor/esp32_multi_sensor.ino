#include <ArduinoJson.h>
#include <DallasTemperature.h>
#include <OneWire.h>

const char *DEVICE_ID = "esp32-sensor-01";

constexpr uint8_t TEMPERATURE_PIN = 4;
constexpr uint8_t MQ_PIN = 34;
constexpr uint8_t TRIG_PIN = 5;
constexpr uint8_t ECHO_PIN = 18;
constexpr unsigned long SAMPLE_INTERVAL_MS = 5000;
constexpr unsigned long ULTRASONIC_TIMEOUT_US = 30000;

OneWire oneWire(TEMPERATURE_PIN);
DallasTemperature temperatureSensor(&oneWire);
unsigned long lastSample = 0;

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, ULTRASONIC_TIMEOUT_US);
  if (duration == 0) return NAN;
  float distance = duration * 0.0343f / 2.0f;
  return distance >= 2.0f && distance <= 400.0f ? distance : NAN;
}

void publishTelemetry() {
  temperatureSensor.requestTemperatures();
  float temperature = temperatureSensor.getTempCByIndex(0);
  int mqRaw = analogRead(MQ_PIN);
  float distance = readDistanceCm();

  JsonDocument document;
  document["device_id"] = DEVICE_ID;
  document["recorded_at_ms"] = millis();
  if (temperature != DEVICE_DISCONNECTED_C && temperature >= -55.0f && temperature <= 125.0f) {
    document["temperature_c"] = temperature;
  }
  if (mqRaw >= 0 && mqRaw <= 4095) document["mq_raw"] = mqRaw;
  if (!isnan(distance)) document["distance_cm"] = distance;

  char payload[256];
  serializeJson(document, payload, sizeof(payload));
  Serial.println(payload);
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  analogReadResolution(12);
  temperatureSensor.begin();
}

void loop() {
  if (millis() - lastSample >= SAMPLE_INTERVAL_MS) {
    lastSample = millis();
    publishTelemetry();
  }
}
