import architectureDiagram from '../assets/iot-architecture.svg'
import mqttDiagram from '../assets/mqtt-flow.svg'
import piPinout from '../assets/raspberry-pi-pinout.svg'
import dataFlowDiagram from '../assets/data-flow.svg'

const unsplash = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`

const videos = {
  introduction: { id: '6mBO2vqLv38', title: 'Introduction to ESP32 - Getting Started', channel: 'DroneBot Workshop', url: 'https://youtu.be/6mBO2vqLv38?si=_9O5sFXNI91RWC23' },
  architecture: { id: 'KeaeuUcw02Q', title: 'How to Install Mosquitto MQTT Broker on Raspberry Pi & Connect ESP32', channel: 'IoT Bhai', url: 'https://youtu.be/KeaeuUcw02Q?si=zj9dDjsoadnBAgJY' },
  devicesSensors: { id: '8VOuA2LFRYA', title: 'Introduction to ESP32 - Getting Started', channel: 'DroneBot Workshop', url: 'https://youtu.be/8VOuA2LFRYA?si=GigtSFEeRkhNlCZ7' },
  protocols: { id: 'mXk3tZ0DkxM', title: 'Getting Started with ESP32 & MQTT', channel: 'IoT Bhai', url: 'https://youtu.be/mXk3tZ0DkxM?si=HCBVNCl44HT3H4Y9' },
  edgeCloud: { id: 'QrkT91wz8Vo', title: 'How to Install Mosquitto MQTT Broker on Raspberry Pi & Connect ESP32', channel: 'IoT Bhai', url: 'https://youtu.be/QrkT91wz8Vo?si=nm8sUXSzBOsuvCPe' },
  applications: { id: 'nOZOHRABOBs', title: 'How to Install Mosquitto MQTT Broker on Raspberry Pi & Connect ESP32', channel: 'IoT Bhai', url: 'https://youtu.be/nOZOHRABOBs?si=xxydSfzxEuTrKkTL' },
  benefitsChallenges: { id: 'Af0_XSwiNOY', title: 'How to Install Mosquitto MQTT Broker on Raspberry Pi & Connect ESP32', channel: 'IoT Bhai', url: 'https://youtu.be/Af0_XSwiNOY?si=ywfGTfxhZeOM57is' },
  security: { id: '7zWVxrjjIpE', title: 'Getting Started with ESP32 & MQTT', channel: 'IoT Bhai', url: 'https://youtu.be/7zWVxrjjIpE?si=VxJVBS9OUGHx3fOL' },
  dataFlow: { id: 'md59uC739u0', title: 'How to Install Mosquitto MQTT Broker on Raspberry Pi & Connect ESP32', channel: 'IoT Bhai', url: 'https://youtu.be/md59uC739u0?si=5FOyxCaUkih0E1mR' },
  esp32Introduction: { id: 'xPlN_Tk3VLQ', title: 'Introduction to ESP32 - Getting Started', channel: 'DroneBot Workshop', url: 'https://youtu.be/xPlN_Tk3VLQ?si=0dK2dqyAuOObQZWv' },
  esp32Setup: { id: 'AitCKcyjHuQ', title: 'Getting Started with ESP32 - Step-By-Step Tutorial', channel: 'Tomasz Tarnowski', url: 'https://youtu.be/AitCKcyjHuQ?si=58EgQYPtloY_MAOr' },
  esp32Sensors: { id: 'ou6IYGcSgj4', title: 'Introduction to ESP32 - Getting Started', channel: 'DroneBot Workshop', url: 'https://youtu.be/ou6IYGcSgj4?si=L78BzowGXwAiywMj' },
  esp32Wifi: { id: '6zbEVAXVBjI', title: 'Getting Started with ESP32 - Step-By-Step Tutorial', channel: 'Tomasz Tarnowski', url: 'https://youtu.be/6zbEVAXVBjI?si=GeC_q1RABLplsKe1' },
  esp32Mqtt: { id: 'OAoM5IV393o', title: 'Getting Started with ESP32 & MQTT', channel: 'IoT Bhai', url: 'https://youtu.be/OAoM5IV393o?si=OZuMT5ifWo1RqYo' },
  esp32Integration: { id: 'vBD1x9yAfgs', title: 'Getting Started with ESP32 & MQTT', channel: 'IoT Bhai', url: 'https://youtu.be/vBD1x9yAfgs?si=hiAO3DYxJMp7V1QD' },
  raspberryPiIntroduction: { id: '3zEzh5-f4KA', title: 'How to Install Mosquitto MQTT Broker on Raspberry Pi & Connect ESP32', channel: 'IoT Bhai', url: 'https://youtu.be/3zEzh5-f4KA?si=9jP-jy6oPlWxRzPI' },
  raspberryPiSetup: { id: 'RV0saVGXQ5k', title: 'How to Install Mosquitto MQTT Broker on Raspberry Pi & Connect ESP32', channel: 'IoT Bhai', url: 'https://youtu.be/RV0saVGXQ5k?si=9VgVvK3VAPWNVJxY' },
  raspberryPiSensors: { id: '9b5zs33QGA4', title: 'Raspberry Pi GPIO Python Guide', channel: 'Raspberry Pi community tutorial', url: 'https://youtu.be/9b5zs33QGA4?si=gPIiM3qqn9qMS5MH' },
  raspberryPiDirect: { id: 'gnE4v-PcYKQ', title: 'How to Install Mosquitto MQTT Broker on Raspberry Pi & Connect ESP32', channel: 'IoT Bhai', url: 'https://youtu.be/gnE4v-PcYKQ?si=wONaQ-Feh2dVVJZn' }
}

const shared = {
  wifi: `#include <WiFi.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWi-Fi connected: " + WiFi.localIP().toString());
}

void loop() { delay(1000); }`,
  mqtt: `#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* broker = "192.168.1.50"; // reachable LAN address, not localhost
const char* deviceId = "esp32-001";
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

void reconnect() {
  while (!mqtt.connected()) {
    if (mqtt.connect(deviceId, "MQTT_USER", "MQTT_PASSWORD")) break;
    delay(2000);
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  mqtt.setServer(broker, 1883);
}

void loop() {
  if (!mqtt.connected()) reconnect();
  mqtt.loop();
  String payload = "{\\"device_id\\":\\"esp32-001\\",\\"sensor\\":\\"temperature\\",\\"value\\":24.2,\\"unit\\":\\"C\\"}";
  mqtt.publish("iot/devices/esp32-001/telemetry", payload.c_str());
  delay(10000);
}`,
  piDirect: `#!/usr/bin/env python3
import os
from datetime import datetime, timezone
import requests

API_URL = os.environ["PULSE_API_URL"]  # e.g. http://server:8000/api
TOKEN = os.environ["PULSE_API_TOKEN"]
payload = {
    "sensor": "temperature",
    "device_id": os.environ["PULSE_DEVICE_ID"],
    "value": 24.2,
    "unit": "C",
    "recorded_at": datetime.now(timezone.utc).isoformat(),
}
response = requests.post(
    f"{API_URL}/readings",
    json=payload,
    headers={"Authorization": f"Bearer {TOKEN}"},
    timeout=10,
)
response.raise_for_status()
print(response.json())`,
  piMqtt: `import json
import os
import requests
import paho.mqtt.client as mqtt

TOPIC = "iot/devices/esp32-001/telemetry"
API = os.environ["PULSE_API_URL"]
TOKEN = os.environ["PULSE_API_TOKEN"]

def on_message(client, userdata, message):
    try:
        body = json.loads(message.payload)
        if body["device_id"] != "esp32-001":
            raise ValueError("unexpected device")
        for sensor, value in body["sensors"].items():
            requests.post(f"{API}/readings", json={
                "device_id": body["device_id"], "sensor": sensor,
                "value": float(value), "unit": "native",
                "recorded_at": body["timestamp"],
            }, headers={"Authorization": f"Bearer {TOKEN}"}, timeout=10).raise_for_status()
    except (ValueError, KeyError, json.JSONDecodeError) as error:
        print(f"Rejected message: {error}")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.username_pw_set(os.environ["MQTT_USER"], os.environ["MQTT_PASSWORD"])
client.on_message = on_message
client.connect(os.environ["MQTT_HOST"], 1883)
client.subscribe(TOPIC, qos=1)
client.loop_forever()`
}

export const detailedLessons = [
  {
    slug: 'introduction', title: 'Introduction to IoT', category: 'IoT Fundamentals', difficulty: 'Beginner', time: '10 min',
    image: unsplash('photo-1518770660439-4636190af475'), alt: 'Circuit board representing connected hardware',
    intro: 'The Internet of Things connects physical objects to software so that a real-world condition can become an observation, decision, or action. The important unit is not a sensor alone; it is the complete loop of sensing, communication, processing, and response.',
    objectives: ['Explain the difference between a sensor, device, gateway, and cloud service.', 'Describe how a timestamped reading becomes useful telemetry.', 'Trace one reading through this platform from hardware to dashboard.'],
    sections: [
      ['What makes a thing “smart”?', 'A connected object has an identity, a way to observe its environment, a network path, and software that gives the observation meaning. A greenhouse node might measure temperature every minute, publish a small JSON message, and trigger an alert when the value crosses a threshold.'],
      ['The platform connection', 'In this project, a device is registered in FastAPI and persisted in PostgreSQL. Readings are associated with that device, exposed through the readings API, and rendered in React charts. MQTT is the planned transport for physical devices; the browser never needs to know the sensor wiring.']
    ],
    practical: 'Imagine a cold-room sensor that reports 8.2 °C. The value becomes operationally useful only when the system knows which room produced it, whether the reading is fresh, what unit it uses, and who should be alerted.',
    steps: ['Identify the physical quantity and choose a sensor.', 'Give the device a stable ID such as esp32-001.', 'Send a timestamp, value, unit, and device ID.', 'Store and visualize the reading, then define a response.'],
    output: 'A complete telemetry record: device esp32-001, sensor temperature, value 8.2, unit °C, and an ISO-8601 timestamp.',
    troubleshooting: [['No data appears', 'Check device identity, network reachability, authentication, and that the timestamp is valid UTC.'], ['Values look impossible', 'Check sensor voltage, units, calibration, and whether a string was parsed as a number.']],
    check: { question: 'Which combination makes a raw measurement useful?', options: ['A color and an icon', 'Identity, timestamp, value, and unit', 'Only a Wi-Fi password'], answer: 1, explanation: 'Context makes telemetry comparable, queryable, and actionable.' },
    summary: 'IoT is a system loop: observe, transport, understand, and act. Start with clear identities and well-formed telemetry.',
    resources: [{ label: 'NIST IoT cybersecurity baseline', url: 'https://www.nist.gov/itl/applied-cybersecurity/nist-cybersecurity-iot-program' }],
    video: videos.introduction
  },
  {
    slug: 'architecture', title: 'IoT Architecture', category: 'IoT Fundamentals', difficulty: 'Intermediate', time: '14 min',
    image: architectureDiagram, alt: 'Layered Internet of Things architecture diagram',
    intro: 'A layered architecture keeps a physical device, a network, data processing, and user experience from becoming one fragile program. Each layer has a clear job and a clear failure mode.',
    objectives: ['Map perception, network, processing, and application layers.', 'Choose where validation, buffering, and alert rules belong.', 'Explain the React–FastAPI–PostgreSQL boundaries in this application.'],
    sections: [
      ['Perception and network', 'The perception layer contains sensors and actuators. The network layer includes Wi-Fi, Ethernet, BLE, LoRaWAN, MQTT, and HTTP. Keep messages small and explicit; a gateway can translate a constrained field protocol into a service API.'],
      ['Processing and application', 'FastAPI validates request data and coordinates database transactions. PostgreSQL provides durable relationships and time-indexed history. React presents health, readings, and alerts without owning the source of truth.']
    ],
    practical: 'When an ESP32 loses Wi-Fi, an edge gateway can buffer readings locally. When PostgreSQL is unavailable, the application should show a degraded state rather than inventing successful writes.',
    steps: ['Draw the path from sensor to operator.', 'Mark every boundary where authentication and validation occur.', 'Decide what can run locally during an outage.', 'Add correlation IDs and logs at service boundaries.'],
    output: 'A diagram with four layers and explicit arrows: sensor → network → FastAPI/PostgreSQL → React.',
    troubleshooting: [['A dashboard is stale', 'Compare device timestamp, broker receipt time, API response time, and browser refresh time.'], ['A gateway overloads', 'Reduce payload size, batch non-critical readings, and move only durable aggregation upstream.']],
    check: { question: 'Where should durable device and reading relationships live?', options: ['Only in React state', 'PostgreSQL behind the API', 'Inside an iframe'], answer: 1, explanation: 'The API and database provide a shared, durable source of truth.' },
    summary: 'Layering makes reliability and security responsibilities visible. The current platform follows device → API → database → UI boundaries.',
    resources: [{ label: 'AWS IoT architecture fundamentals', url: 'https://docs.aws.amazon.com/iot/latest/developerguide/iot-introduction.html' }],
    video: videos.architecture
  },
  {
    slug: 'devices-sensors', title: 'Devices and Sensors', category: 'Sensors and Hardware', difficulty: 'Beginner', time: '18 min',
    image: unsplash('photo-1553406830-ef2513450d76'), alt: 'Microcontroller board and electronic components',
    intro: 'A sensor is an interface to the physical world. Choosing one is an engineering decision involving range, accuracy, response time, voltage, interface, environmental protection, and maintenance.',
    objectives: ['Distinguish digital, analog, and bus-connected sensors.', 'Select a microcontroller or gateway for a measurement job.', 'Avoid unsafe voltage levels on ESP32 and Raspberry Pi inputs.'],
    sections: [
      ['Common sensor interfaces', 'Digital sensors expose a binary state or a protocol. Analog sensors expose a voltage that must be converted by an ADC. I2C and SPI let multiple sensors share a bus, but require correct pull-ups, addresses, wiring, and voltage levels.'],
      ['Boards and actuators', 'An ESP32 is a low-power microcontroller with Wi-Fi and Bluetooth on many models. A Raspberry Pi computer runs Linux and can act as a gateway. Actuators—relays, motors, valves, and LEDs—turn a software decision back into a physical change.']
    ],
    practical: 'A DHT22 is useful for a slow temperature/humidity demo; an industrial RTD or 4–20 mA transmitter is more appropriate for a harsh plant. Match the component to the environment, not just the tutorial.',
    steps: ['Read the sensor datasheet before wiring.', 'Confirm logic voltage and power requirements.', 'Connect ground first, then power and signal.', 'Validate range and plausibility before publishing.'],
    output: 'A sensor card that reports a numeric reading, unit, device ID, and freshness indicator.',
    troubleshooting: [['Sensor returns NaN', 'Check power, ground, pull-up resistors, library version, and sampling interval.'], ['Board resets', 'Check current supply, USB cable quality, and whether an actuator causes a voltage dip.']],
    check: { question: 'Why must voltage be checked before connecting a sensor?', options: ['To improve font rendering', 'GPIO pins can be damaged by unsupported voltage', 'It changes the MQTT topic'], answer: 1, explanation: 'ESP32 and Raspberry Pi GPIO are not universal 5 V-tolerant inputs.' },
    summary: 'Hardware reliability starts with datasheets, voltage discipline, and a measurement plan.',
    resources: [{ label: 'ESP32 technical reference', url: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/' }],
    video: videos.devicesSensors
  },
  {
    slug: 'protocols', title: 'Communication Protocols', category: 'MQTT and Networking', difficulty: 'Intermediate', time: '16 min',
    image: mqttDiagram, alt: 'MQTT publisher broker subscriber diagram',
    intro: 'Communication protocols define how devices exchange information. MQTT is designed for lightweight publish/subscribe telemetry, while HTTP is a natural fit for request/response APIs such as FastAPI.',
    objectives: ['Explain MQTT publishers, subscribers, topics, brokers, and QoS.', 'Choose between MQTT, HTTP, WebSockets, and low-power links.', 'Use the platform topic conventions safely.'],
    sections: [
      ['MQTT topics in this platform', 'Publish telemetry to iot/devices/{device_id}/telemetry, status to iot/devices/{device_id}/status, and commands to iot/devices/{device_id}/commands. A topic is not authorization: broker ACLs must still restrict which devices can publish or subscribe.'],
      ['Transport trade-offs', 'HTTP is easy to debug and works well for device registration and ingestion endpoints. WebSockets suit live browser updates. BLE and Zigbee are local links, while LoRaWAN favors long range and small payloads over throughput.']
    ],
    practical: 'An ESP32 publishes a JSON telemetry message; a broker routes it to a Raspberry Pi subscriber; the gateway validates it and calls FastAPI. QoS improves delivery behavior, but it does not guarantee exactly-once database storage.',
    steps: ['Choose a topic hierarchy that includes device identity.', 'Use TLS and credentials for the broker.', 'Select QoS based on loss and latency requirements.', 'Add a message ID or timestamp for deduplication.'],
    output: '{"device_id":"esp32-001","sensor":"temperature","value":24.2,"unit":"C"}',
    troubleshooting: [['Broker connects but no messages arrive', 'Check topic spelling, ACLs, subscription timing, and broker reachability from the device network.'], ['Messages duplicate', 'Use a message ID and idempotent database handling; QoS alone is not deduplication.']],
    check: { question: 'What does an MQTT broker do?', options: ['Routes publish/subscribe messages', 'Measures voltage', 'Compiles Python'], answer: 0, explanation: 'The broker routes messages between publishers and subscribers.' },
    summary: 'Use MQTT for lightweight event transport and HTTP for explicit API operations. Secure both boundaries.',
    resources: [{ label: 'MQTT 5.0 specification', url: 'https://mqtt.org/mqtt-specification/' }],
    video: videos.protocols
  },
  {
    slug: 'edge-cloud', title: 'Edge and Cloud Computing', category: 'IoT Fundamentals', difficulty: 'Intermediate', time: '12 min',
    image: unsplash('photo-1451187580459-43490279c0fa'), alt: 'Cloud computing network illustration',
    intro: 'Edge computing places time-sensitive processing close to devices; cloud computing provides shared storage, fleet-wide analysis, and access from anywhere. Robust IoT systems combine the two.',
    objectives: ['Identify latency, bandwidth, and availability trade-offs.', 'Design a hybrid edge-to-cloud pipeline.', 'Choose what data to buffer, aggregate, or retain.'],
    sections: [
      ['What belongs at the edge?', 'Safety interlocks, local control, filtering, and short-term buffering are good edge responsibilities. The edge should continue useful work when the uplink is down.'],
      ['What belongs in the cloud or server?', 'Fleet analytics, durable history, access control, and cross-site reporting benefit from centralized services. In this platform, FastAPI and PostgreSQL are the durable processing boundary.']
    ],
    practical: 'A gateway can calculate a rolling vibration average locally and send an alert immediately, while uploading raw samples in batches when bandwidth allows.',
    steps: ['Define the maximum acceptable control latency.', 'Estimate payload rate and connection reliability.', 'Choose local fallback behavior.', 'Document how buffered events are replayed without duplicates.'],
    output: 'A pipeline that shows local filtering and buffering before secure API ingestion.',
    troubleshooting: [['Cloud data has gaps', 'Inspect edge buffer depth, clock drift, retry policy, and server response codes.']],
    check: { question: 'Which task is usually a good edge responsibility?', options: ['Local safety cutoff', 'Cross-site monthly report', 'User password reset UI'], answer: 0, explanation: 'Safety decisions should not depend on a round trip to a distant service.' },
    summary: 'Use the edge for responsiveness and resilience; use centralized services for durable, shared intelligence.',
    resources: [{ label: 'Azure IoT edge overview', url: 'https://learn.microsoft.com/azure/iot-edge/about-iot-edge' }],
    video: videos.edgeCloud
  },
  {
    slug: 'applications', title: 'IoT Applications', category: 'IoT Fundamentals', difficulty: 'Beginner', time: '11 min',
    image: unsplash('photo-1565793298595-6a879b1d9492'), alt: 'Industrial automation equipment',
    intro: 'IoT applications are valuable when a measurement changes a decision. The same observe–understand–act pattern appears in factories, agriculture, healthcare, energy, homes, and cities.',
    objectives: ['Recognize common IoT value patterns.', 'Connect a domain problem to measurable telemetry.', 'Define an alert or action with an owner.'],
    sections: [
      ['From visibility to action', 'A dashboard is not the final goal. A maintenance team needs a prioritized work order; an irrigation system needs a safe control decision; a city operator needs a trend and an accountable response.'],
      ['Designing useful metrics', 'Pair technical metrics such as uptime and packet loss with outcomes such as energy saved, downtime avoided, or water used per crop yield.']
    ],
    practical: 'The Pulse dashboard combines fleet uptime, sensor freshness, and alert resolution so an operations team can connect telemetry quality to real work.',
    steps: ['Name the decision owner.', 'Define the measured outcome.', 'Select the minimum useful sensors.', 'Pilot with a baseline and review false alerts.'],
    output: 'A measurable use case with a device, signal, threshold, owner, and outcome.',
    troubleshooting: [['Many alerts are ignored', 'Reduce noise, add severity and context, and define an explicit response time.']],
    check: { question: 'What makes an IoT project valuable?', options: ['More charts regardless of outcome', 'A reliable measurement tied to a decision', 'A longer device name'], answer: 1, explanation: 'Value comes from improving a decision or outcome.' },
    summary: 'Start with a decision and outcome, then work backward to sensors and connectivity.',
    resources: [{ label: 'NIST IoT program', url: 'https://www.nist.gov/itl/applied-cybersecurity/nist-cybersecurity-iot-program' }],
    video: videos.applications
  },
  {
    slug: 'benefits-challenges', title: 'Benefits and Challenges', category: 'IoT Fundamentals', difficulty: 'Beginner', time: '10 min',
    image: unsplash('photo-1516321318423-f06f85e504b3'), alt: 'Team reviewing operational data',
    intro: 'Connected systems can improve efficiency, safety, and visibility, but they also create a distributed operational surface. Power, security, interoperability, and lifecycle costs must be planned from the beginning.',
    objectives: ['Balance automation benefits against operational risks.', 'Identify fleet lifecycle responsibilities.', 'Plan for failure rather than assuming connectivity is permanent.'],
    sections: [
      ['The benefits', 'Continuous data supports predictive maintenance, remote diagnostics, energy optimization, and safer operations. Automated workflows can reduce repetitive checks without removing human accountability.'],
      ['The challenges', 'Devices age, networks fail, firmware becomes vulnerable, and different vendors disagree about data models. Plan inventory, updates, certificates, spares, and alert ownership.']
    ],
    practical: 'A low-cost sensor that cannot be recalibrated or securely updated may create more operational risk than value after the pilot.',
    steps: ['Estimate total lifecycle cost.', 'Define an update and replacement process.', 'Document fallback behavior.', 'Measure false alerts and maintenance effort.'],
    output: 'A risk register covering power, network, security, data quality, and ownership.',
    troubleshooting: [['Pilot works but fleet does not scale', 'Automate provisioning, inventory, health checks, and staged rollouts before expanding.']],
    check: { question: 'Which is a lifecycle concern?', options: ['Firmware updates', 'Button border radius', 'Video thumbnail color'], answer: 0, explanation: 'A deployed device needs maintenance throughout its useful life.' },
    summary: 'IoT value is sustainable only when operations, security, and lifecycle ownership are explicit.',
    resources: [{ label: 'OWASP IoT Top 10', url: 'https://owasp.org/www-project-internet-of-things/' }],
    video: videos.benefitsChallenges
  },
  {
    slug: 'security', title: 'IoT Security', category: 'Security and Troubleshooting', difficulty: 'Advanced', time: '18 min',
    image: unsplash('photo-1563013544-824ae1b704d3'), alt: 'Lock representing digital security',
    intro: 'IoT security protects physical systems, data, and people across the entire device lifecycle. Authentication, authorization, encrypted transport, secure updates, and revocation work together.',
    objectives: ['Explain device identity and mutual TLS.', 'Apply least-privilege MQTT ACLs and API tokens.', 'Plan secure storage, OTA updates, and revocation.'],
    sections: [
      ['Identity and transport', 'Give each device a unique identity and rotate credentials. Use TLS for MQTT and HTTPS for API requests. Never ship Wi-Fi, broker, or API secrets in a public frontend bundle.'],
      ['Authorization and updates', 'An ESP32 should publish only to its own telemetry topic. A gateway should have only the API permissions it needs. Firmware should be signed, versioned, and rolled out in stages with a rollback plan.']
    ],
    practical: 'The example code uses placeholders and environment variables. `localhost` on an ESP32 means the ESP32 itself, not the computer running FastAPI; use a reachable LAN address or secure hostname.',
    steps: ['Create a per-device identity.', 'Issue least-privilege broker and API credentials.', 'Encrypt traffic and validate server certificates.', 'Log security events and rehearse credential revocation.'],
    output: 'A security checklist with identity, TLS, ACL, token, update, and revoke controls.',
    troubleshooting: [['TLS fails', 'Check certificate chain, device clock, hostname, CA bundle, and broker port.'], ['Credential leaked', 'Revoke it immediately, rotate dependent secrets, and inspect logs for misuse.']],
    check: { question: 'Why are MQTT credentials not frontend configuration?', options: ['They are secrets used by a device or gateway', 'They improve CSS', 'They are only lesson metadata'], answer: 0, explanation: 'Secrets must stay in protected device/server configuration, not public bundles.' },
    summary: 'Secure identity and transport first, then restrict permissions and maintain the device throughout its lifecycle.',
    resources: [{ label: 'NISTIR 8259 IoT device cybersecurity', url: 'https://csrc.nist.gov/publications/detail/nistir/8259/final' }],
    video: videos.security
  },
  {
    slug: 'data-flow', title: 'IoT Data Flow', category: 'IoT Fundamentals', difficulty: 'Intermediate', time: '15 min',
    image: dataFlowDiagram, alt: 'Data flow from IoT device to cloud dashboard',
    intro: 'Following one reading end to end is the fastest way to understand an IoT platform. Each boundary should preserve identity, time, unit, and validity while adding observability.',
    objectives: ['Trace sensor → device → MQTT/HTTP → FastAPI → PostgreSQL → React.', 'Identify where validation and authentication occur.', 'Explain why idempotency matters when messages retry.'],
    sections: [
      ['The persistent path', 'A physical sensor is sampled by an ESP32 or Raspberry Pi. A gateway or client sends an authenticated request to FastAPI. The API validates the payload and persists it with a foreign key to a device and an indexed measurement timestamp.'],
      ['The read path', 'React logs in, obtains a bearer token, requests dashboard statistics or readings, and renders the response. A failed request becomes an explicit error state rather than a fake success.']
    ],
    practical: 'Use the backend Swagger UI to inspect the actual contract before writing a hardware client. This project exposes authenticated read APIs and device CRUD; an ingestion POST route is required before hardware can submit readings.',
    steps: ['Register a device and save its ID.', 'Obtain a token through `/api/auth/login`.', 'Send a validated reading to the ingestion endpoint.', 'Verify the record through `/api/readings/history` and the dashboard.'],
    output: 'The same reading visible in the API response, PostgreSQL history, and React monitoring view.',
    troubleshooting: [['401 Unauthorized', 'Check token expiry and the `Authorization: Bearer` header.'], ['422 Unprocessable Entity', 'Compare field names, types, units, and timestamp format with Swagger.']],
    check: { question: 'Where should the source of truth for history live?', options: ['A browser chart only', 'PostgreSQL behind FastAPI', 'A YouTube iframe'], answer: 1, explanation: 'The database provides durable, queryable history.' },
    summary: 'A reliable data flow preserves context at every boundary and makes failures visible.',
    resources: [{ label: 'FastAPI request body documentation', url: 'https://fastapi.tiangolo.com/tutorial/body/' }],
    video: videos.dataFlow
  },
  {
    slug: 'esp32-introduction', title: 'Introduction to ESP32', category: 'ESP32 Development', difficulty: 'Beginner', time: '18 min',
    image: unsplash('photo-1553406830-ef2513450d76'), alt: 'ESP32-style development board with header pins',
    intro: 'The ESP32 is a microcontroller family widely used for connected sensor nodes. It combines a CPU, memory, GPIO, analog inputs, PWM, serial buses, and—on common modules—Wi-Fi and Bluetooth in a small, low-power board.',
    objectives: ['Identify GPIO, ADC, PWM, I2C, SPI, and UART roles.', 'Compare an ESP32 microcontroller with a Raspberry Pi computer.', 'Choose an ESP32 for low-power telemetry collection.'],
    sections: [
      ['Interfaces', 'GPIO reads or drives digital signals. ADC samples analog voltage. PWM approximates analog control for LEDs and motors. I2C uses SDA/SCL for addressed peripherals; SPI uses a clock and chip-select lines for higher throughput; UART provides serial communication. Pin capabilities vary by board, so check the exact pinout.'],
      ['ESP32 versus Raspberry Pi', 'An ESP32 boots a firmware program and is efficient for direct sensing. A Raspberry Pi runs Linux, has more memory and storage, and is better suited to gateway software, local databases, and Python services. They complement one another.']
    ],
    practical: 'An ESP32 can read a DHT22, connect to Wi-Fi, and publish telemetry to `iot/devices/esp32-001/telemetry`. The existing platform can then associate that identity with a PostgreSQL device record.',
    steps: ['Select a board and inspect its pinout.', 'Power it from a suitable USB supply.', 'Start with serial output before adding networking.', 'Add one sensor and validate its values before publishing.'],
    output: 'A serial log showing a stable boot and sensor values at a known interval.',
    troubleshooting: [['A pin does not behave as expected', 'Some pins are input-only, boot-strapping pins, or board-specific; check the board datasheet.']],
    check: { question: 'What is the main difference between ESP32 and Raspberry Pi?', options: ['ESP32 is a microcontroller; Raspberry Pi is a Linux computer', 'They are identical', 'Raspberry Pi cannot network'], answer: 0, explanation: 'Their software model, resources, and typical roles differ.' },
    summary: 'ESP32 boards are excellent low-power connected sensor nodes; treat each pin and voltage according to its board documentation.',
    resources: [{ label: 'Espressif ESP32 documentation', url: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/' }],
    video: videos.esp32Introduction
  },
  {
    slug: 'esp32-setup', title: 'ESP32 Setup and Programming', category: 'ESP32 Development', difficulty: 'Beginner', time: '20 min',
    image: unsplash('photo-1518770660439-4636190af475'), alt: 'Electronics development workstation',
    intro: 'A dependable first setup removes uncertainty before sensors and networks are added. Install Arduino IDE, add Espressif board support, select the exact board and serial port, and verify a serial program.',
    objectives: ['Install the ESP32 Arduino board package.', 'Upload a program and open the serial monitor.', 'Diagnose USB, port, boot, and board-selection failures.'],
    sections: [
      ['Required materials', 'Use an ESP32 development board, a data-capable USB cable, a computer, and Arduino IDE. Some boards need a USB-UART driver. A charge-only cable will power the board but cannot upload code.'],
      ['First program', 'Set the serial monitor to 115200 baud. Upload the following sketch, then press reset if the board does not print immediately.']
    ],
    code: `void setup() {
  Serial.begin(115200);
}

void loop() {
  static unsigned long count = 0;
  Serial.printf("ESP32 ready; sample %lu\\n", count++);
  delay(1000);
}`,
    output: 'ESP32 ready; sample 0, ESP32 ready; sample 1, and so on once per second.',
    troubleshooting: [['Port is missing', 'Use a data cable, install the correct USB-UART driver, and reconnect the board.'], ['Timed out waiting for packet header', 'Select the correct board, hold BOOT while upload starts, and check the cable.'], ['Garbled output', 'Set the monitor to the same 115200 baud rate used by the sketch.']],
    check: { question: 'What does a charge-only USB cable prevent?', options: ['Powering the board', 'Data upload and serial communication', 'Using GPIO'], answer: 1, explanation: 'A charge-only cable has no data conductors.' },
    summary: 'Prove the board, port, upload process, and serial output before introducing more variables.',
    resources: [{ label: 'Arduino ESP32 core installation', url: 'https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html' }],
    video: videos.esp32Setup
  },
  {
    slug: 'esp32-sensors', title: 'Connecting Sensors to ESP32', category: 'ESP32 Development', difficulty: 'Intermediate', time: '26 min',
    image: unsplash('photo-1581091226825-a6a2a5aee158'), alt: 'Electronic sensor modules and wiring',
    intro: 'Sensor wiring is a system of power, ground, signal, voltage, and timing. A DHT22 is a useful educational example because it demonstrates a digital single-wire data signal and a library-managed reading cycle.',
    objectives: ['Wire a DHT22 safely to an ESP32.', 'Distinguish digital, analog, and I2C sensors.', 'Validate and format readings before publishing them.'],
    sections: [
      ['Parts and wiring', 'Use an ESP32, DHT22, 10 kΩ pull-up resistor if your module does not include one, jumper wires, and a breadboard. Connect VCC to the sensor-rated supply, GND to GND, and DATA to a documented GPIO such as GPIO 4. Never assume a 5 V signal is safe for ESP32 GPIO.'],
      ['Reading discipline', 'DHT22 readings are slow; respect the sensor interval in its datasheet. Reject NaN values, include units, and record the time the measurement was taken.']
    ],
    code: `#include <DHT.h>
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() { Serial.begin(115200); dht.begin(); }
void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Sensor read failed");
  } else {
    Serial.printf("temperature=%.1f C humidity=%.1f %%\\n", temperature, humidity);
  }
  delay(2500);
}`,
    output: 'temperature=24.1 C humidity=58.6 %',
    troubleshooting: [['Read failed', 'Check the pull-up, common ground, data pin, sensor interval, and library type.'], ['ESP32 resets', 'Use a stable supply and confirm the sensor is not wired to an unsupported voltage.']],
    check: { question: 'What must be checked before a sensor is connected?', options: ['Voltage and pin function', 'Only its color', 'The dashboard font'], answer: 0, explanation: 'Voltage and pin capability protect hardware and ensure the signal is readable.' },
    summary: 'Wire by datasheet, respect sensor timing, validate values, and never assume voltage compatibility.',
    resources: [{ label: 'Adafruit DHT sensor guide', url: 'https://learn.adafruit.com/dht11-basic-ultra-low-cost-temperature-and-humidity-sensor-python-library' }],
    video: videos.esp32Sensors
  },
  {
    slug: 'esp32-wifi', title: 'Connecting ESP32 to Wi-Fi', category: 'ESP32 Development', difficulty: 'Beginner', time: '18 min',
    image: unsplash('photo-1558494949-ef010cbdcc31'), alt: 'Network cables and connected infrastructure',
    intro: 'Wi-Fi gives an ESP32 a path to the broker or API, but the network must be configured for the physical deployment. The broker host must be reachable from the ESP32; `localhost` refers to the ESP32 itself.',
    objectives: ['Configure Wi-Fi with placeholders instead of committed secrets.', 'Report connection status and local IP.', 'Handle disconnections without crashing the device.'],
    sections: [
      ['Safe configuration', 'Use compile-time placeholders for a classroom sketch and inject real secrets through a protected local configuration process. Do not commit credentials to source control or expose them in a frontend bundle.'],
      ['Network reachability', 'If FastAPI or Mosquitto runs on a laptop, use the laptop’s LAN address and allow the relevant firewall port. A private network and TLS are preferable to exposing a broker publicly.']
    ],
    code: shared.wifi,
    output: 'Wi-Fi connected: 192.168.1.72',
    troubleshooting: [['It loops forever', 'Verify SSID spelling, 2.4 GHz compatibility, signal strength, and that the access point is available.'], ['Broker cannot be reached', 'Use a LAN address, verify port and firewall rules, and test from the same network.']],
    check: { question: 'What does `localhost` mean on an ESP32?', options: ['The ESP32 itself', 'The developer laptop', 'The public internet'], answer: 0, explanation: 'Use the server’s reachable LAN address for a laptop-hosted broker or API.' },
    summary: 'Wi-Fi code should expose connection state, avoid secrets in commits, and use a host address the hardware can actually reach.',
    resources: [{ label: 'Arduino ESP32 Wi-Fi API', url: 'https://docs.espressif.com/projects/arduino-esp32/en/latest/api/wifi.html' }],
    video: videos.esp32Wifi
  },
  {
    slug: 'esp32-mqtt', title: 'ESP32 and MQTT', category: 'MQTT and Networking', difficulty: 'Intermediate', time: '28 min',
    image: mqttDiagram, alt: 'MQTT broker routing device messages',
    intro: 'MQTT lets an ESP32 publish small telemetry messages without knowing every consumer. The broker handles routing; subscribers such as a Raspberry Pi gateway receive only the topics they are authorized to read.',
    objectives: ['Publish JSON telemetry to the project topic convention.', 'Reconnect safely and authenticate to the broker.', 'Understand QoS, retained messages, and duplicate handling.'],
    sections: [
      ['Topic and payload', 'Publish to `iot/devices/{device_id}/telemetry`. Keep the payload explicit: device ID, timestamp, sensor name, value, and unit. Publish status separately so operations can distinguish a device that is online from one that has fresh telemetry.'],
      ['Reliability', 'Use QoS appropriate to the message, but add an ID or timestamp for idempotent storage. A broker retry can deliver a message more than once; database correctness must handle that explicitly.']
    ],
    code: shared.mqtt,
    output: 'Topic: iot/devices/esp32-001/telemetry; payload: {"device_id":"esp32-001","sensor":"temperature","value":24.2,"unit":"C"}',
    troubleshooting: [['Connects then drops', 'Check broker keep-alive, Wi-Fi signal, credentials, and TLS settings.'], ['Subscriber sees nothing', 'Confirm exact topic, ACL permissions, and that the subscriber is connected before publishing.']],
    check: { question: 'Does MQTT QoS guarantee exactly-once database storage?', options: ['Yes, always', 'No; use IDs or idempotency as well', 'Only when using Wi-Fi'], answer: 1, explanation: 'Transport delivery semantics and database deduplication are different concerns.' },
    summary: 'MQTT simplifies event routing, but secure credentials, clear topics, valid JSON, and idempotent storage remain application responsibilities.',
    resources: [{ label: 'PubSubClient library', url: 'https://github.com/knolleary/pubsubclient' }],
    video: videos.esp32Mqtt
  },
  {
    slug: 'esp32-integration', title: 'ESP32 Integration with the Platform', category: 'ESP32 Development', difficulty: 'Advanced', time: '24 min',
    image: unsplash('photo-1516321318423-f06f85e504b3'), alt: 'Developer monitoring an IoT system',
    intro: 'Integration is a checklist across hardware, broker, API, database, and UI. Keep simulated readings clearly separate from readings received from physical hardware so an operator can trust what the dashboard represents.',
    objectives: ['Register a device and preserve its stable ID.', 'Verify broker and API credentials without exposing secrets.', 'Trace a hardware reading into PostgreSQL and React.'],
    sections: [
      ['Current project boundary', 'The API already supports authenticated device registration, latest/history reads, alerts, thresholds, and CSV export. Before a physical node can submit readings, use the documented ingestion endpoint and verify its request schema in Swagger; never infer a contract from a chart.'],
      ['End-to-end checklist', 'Register the device, configure its topic, publish a test payload, validate the gateway log, confirm the database record, then inspect the dashboard. Record whether each result is simulated or physical.']
    ],
    steps: ['Start PostgreSQL and apply Alembic migrations.', 'Register esp32-001 through the authenticated API.', 'Configure the broker with a reachable host and ACL.', 'Publish one known test payload.', 'Verify API history and dashboard freshness.'],
    output: 'A device card with the physical device ID and a timestamped reading that survives an API restart.',
    troubleshooting: [['Reading is in MQTT but not PostgreSQL', 'Inspect the subscriber log, schema validation, API response, and transaction rollback.'], ['Dashboard says stale', 'Compare recorded_at with current UTC and check the browser request.']],
    check: { question: 'What should distinguish a real hardware reading from a simulation?', options: ['A source or ingestion marker in operations metadata', 'Nothing', 'A different CSS color only'], answer: 0, explanation: 'Operators need to know whether a value was observed or generated for demonstration.' },
    summary: 'Integration is verified boundary by boundary; do not call a simulated value a device reading.',
    resources: [{ label: 'FastAPI OpenAPI docs in this project', url: 'http://localhost:8000/docs' }],
    video: videos.esp32Integration
  },
  {
    slug: 'raspberry-pi-introduction', title: 'Introduction to Raspberry Pi', category: 'Raspberry Pi Development', difficulty: 'Beginner', time: '18 min',
    image: unsplash('photo-1587202372634-32705e3bf49c'), alt: 'Raspberry Pi single-board computer',
    intro: 'A Raspberry Pi computer is a small Linux single-board computer with CPU, memory, storage, networking, USB, and GPIO. It is often used as an edge gateway that can run Python services and bridge local sensors to a backend.',
    objectives: ['Explain Raspberry Pi OS, Linux, storage, networking, and GPIO.', 'Distinguish a Raspberry Pi computer from Pico/Pico W microcontroller boards.', 'Choose a Pi as an edge gateway for this platform.'],
    sections: [
      ['Computer versus microcontroller', 'A Raspberry Pi computer runs processes, filesystems, package managers, and virtual environments. Raspberry Pi Pico and Pico W are microcontroller boards and are not interchangeable with a Pi computer for this gateway tutorial.'],
      ['Gateway role', 'Python can read I2C sensors, subscribe to MQTT, buffer events, and call FastAPI. Use a Pi when the node needs local software, storage, or protocol translation rather than only low-power sampling.']
    ],
    practical: 'A Pi can subscribe to `iot/devices/esp32-001/telemetry`, validate JSON, and forward an authenticated request to the platform API.',
    steps: ['Choose a supported Pi computer and power supply.', 'Install Raspberry Pi OS on compatible storage.', 'Enable networking and SSH securely.', 'Use a virtual environment for gateway dependencies.'],
    output: 'A reachable Linux gateway that can run a Python sensor or MQTT client.',
    troubleshooting: [['Pi will not boot', 'Check storage imaging, power supply, and model compatibility.'], ['SSH unavailable', 'Confirm network address, SSH configuration, credentials, and firewall.']],
    check: { question: 'What is Raspberry Pi Pico?', options: ['A microcontroller family', 'The same as a Pi 4 computer', 'An MQTT broker'], answer: 0, explanation: 'Pico boards are microcontrollers; the computer models run Linux.' },
    summary: 'Raspberry Pi computers are flexible Linux gateways; keep their model, GPIO capabilities, and OS version explicit.',
    resources: [{ label: 'Raspberry Pi documentation', url: 'https://www.raspberrypi.com/documentation/' }],
    video: videos.raspberryPiIntroduction
  },
  {
    slug: 'raspberry-pi-setup', title: 'Raspberry Pi Setup', category: 'Raspberry Pi Development', difficulty: 'Beginner', time: '25 min',
    image: unsplash('photo-1517336714739-489689fd1ca8'), alt: 'Linux development workstation',
    intro: 'A repeatable gateway starts with a known operating system, network identity, secure remote access, and an isolated Python environment. Setup details vary by Pi model and Raspberry Pi OS release.',
    objectives: ['Prepare Raspberry Pi OS and first-boot configuration.', 'Enable SSH and required I2C/SPI interfaces safely.', 'Install Python dependencies in a virtual environment.'],
    sections: [
      ['First boot', 'Use Raspberry Pi Imager to write a supported OS image, configure a user and hostname, and connect to a trusted network. Change default credentials and apply updates before attaching production sensors.'],
      ['Python environment', 'Create a project directory and virtual environment. Keep dependencies in a requirements file so the gateway can be rebuilt after a storage failure.']
    ],
    code: `python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install requests paho-mqtt
python -c "import sys; print(sys.version)"`,
    output: 'A Python version printed from the project virtual environment.',
    troubleshooting: [['I2C device is not visible', 'Enable I2C, check SDA/SCL pins, pull-ups, address, and power.'], ['Package install fails', 'Confirm the venv is active and the Pi has network/DNS access.']],
    check: { question: 'Why use a virtual environment?', options: ['To isolate project dependencies', 'To increase GPIO voltage', 'To bypass authentication'], answer: 0, explanation: 'Isolation prevents unrelated projects from breaking one another.' },
    summary: 'Secure OS setup and repeatable Python environments reduce gateway maintenance.',
    resources: [{ label: 'Raspberry Pi OS documentation', url: 'https://www.raspberrypi.com/documentation/computers/os.html' }],
    video: videos.raspberryPiSetup
  },
  {
    slug: 'raspberry-pi-sensors', title: 'Raspberry Pi GPIO and Sensors', category: 'Raspberry Pi Development', difficulty: 'Intermediate', time: '28 min',
    image: piPinout, alt: 'Raspberry Pi GPIO pinout diagram',
    intro: 'GPIO is powerful but electrically unforgiving. Use the exact model pinout and numbering convention, and remember that Raspberry Pi GPIO signals are 3.3 V—not general-purpose 5 V inputs.',
    objectives: ['Use GPIO, I2C, SPI, and UART appropriately.', 'Wire a compatible I2C temperature/humidity sensor.', 'Read and validate a sensor with Python.'],
    sections: [
      ['Pin discipline', 'A physical pin number and a BCM GPIO number are different labels. Choose one convention in code and wiring documentation. Confirm power, ground, bus pins, address, and pull-ups for the selected sensor.'],
      ['Safe signals', 'Do not apply 5 V directly to a Pi GPIO pin. Use a level shifter where the sensor or peripheral requires it, and confirm the board’s current and voltage limits.']
    ],
    code: `from time import sleep
import board
import adafruit_dht

sensor = adafruit_dht.DHT22(board.D4)
while True:
    try:
        print(f"{sensor.temperature:.1f} C, {sensor.humidity:.1f} %")
    except RuntimeError as error:
        print(f"Retrying sensor read: {error}")
    sleep(2)`,
    output: '24.0 C, 58.2 %',
    troubleshooting: [['Permission denied', 'Use the documented library permissions and avoid running every program as root.'], ['No I2C address', 'Check SDA/SCL, pull-ups, address selection, and `i2cdetect` output.']],
    check: { question: 'Why must the Pi model pinout be checked?', options: ['Pins and capabilities can vary by board', 'All Pi pins are identical', 'It changes the API token'], answer: 0, explanation: 'Physical layout and supported interfaces are board-specific.' },
    summary: 'GPIO projects succeed when wiring, numbering, voltage, and library assumptions agree.',
    resources: [{ label: 'Raspberry Pi GPIO documentation', url: 'https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#gpio' }],
    video: videos.raspberryPiSensors
  },
  {
    slug: 'raspberry-pi-direct', title: 'Raspberry Pi 1: Direct Sensor Connection', category: 'Practical Projects', difficulty: 'Advanced', time: '35 min',
    image: piPinout, alt: 'Raspberry Pi wiring reference for a direct sensor project',
    intro: 'In this project the Raspberry Pi reads a compatible sensor directly and sends validated measurements to the IoT platform. No ESP32 is required. The Pi acts as both sensor reader and API client.',
    objectives: ['Plan direct sensor wiring and verify voltage compatibility.', 'Read a sensor with Python and validate its values.', 'Configure authenticated platform ingestion without committing secrets.'],
    sections: [
      ['Architecture', 'Sensor → Raspberry Pi GPIO/I2C → Python sensor reader → HTTP API → FastAPI → PostgreSQL → React dashboard. Keep the sensor timestamp and device identity with the payload.'],
      ['Project setup', 'Use a Pi computer, compatible DHT22 or I2C sensor, jumper wires, a safe power supply, Raspberry Pi OS, Python, the sensor library, and requests. The current project’s read-only API contract must be extended with an authenticated `POST /api/readings` ingestion route before this exact sender can run.'],
      ['Wiring and security', 'Connect sensor power to its rated voltage, ground to Pi ground, and data to the selected GPIO or I2C bus. Do not connect 5 V signals directly. Store `PULSE_API_URL`, `PULSE_API_TOKEN`, and `PULSE_DEVICE_ID` as environment variables.']
    ],
    code: shared.piDirect,
    output: 'The API returns a created reading and the same timestamp appears in `/api/readings/history` and the dashboard.',
    troubleshooting: [['API returns 404', 'Check that the ingestion endpoint is enabled in the backend version and inspect `/docs`; do not silently substitute a read endpoint.'], ['API returns 401', 'Log in again and pass a bearer token.'], ['Reading rejected', 'Validate device ID, numeric value, unit, and ISO timestamp.']],
    check: { question: 'What is required before the sender can POST a reading?', options: ['An actual supported ingestion endpoint', 'Only a chart', 'A YouTube URL'], answer: 0, explanation: 'The client must match a real backend contract.' },
    summary: 'Direct Pi projects combine safe wiring, Python validation, API authentication, and durable persistence.',
    resources: [{ label: 'Requests quickstart', url: 'https://requests.readthedocs.io/en/latest/user/quickstart/' }],
    video: videos.raspberryPiDirect
  },
  {
    slug: 'raspberry-pi-mqtt', title: 'Raspberry Pi 2: ESP32 Integration Using MQTT', category: 'Practical Projects', difficulty: 'Advanced', time: '42 min',
    image: mqttDiagram, alt: 'ESP32 to MQTT broker to Raspberry Pi gateway architecture',
    intro: 'This project uses the Raspberry Pi as a receiving gateway. The ESP32 publishes a sensor payload over Wi-Fi to an MQTT broker; the Pi validates the message and forwards accepted readings to FastAPI and PostgreSQL.',
    objectives: ['Configure matching ESP32 publisher and Pi subscriber topics.', 'Validate device identity, timestamps, measurements, and duplicates.', 'Forward accepted data using the actual authenticated API contract.'],
    sections: [
      ['Architecture and broker placement', 'Sensor → ESP32 → Wi-Fi → MQTT broker → Raspberry Pi subscriber → FastAPI → PostgreSQL → React. The broker may run on the server or in a container; neither ESP32 nor Pi should assume `localhost` refers to that server.'],
      ['Publisher and subscriber', 'The ESP32 publishes to `iot/devices/esp32-001/telemetry`. The Pi subscribes to the exact topic with an appropriate QoS, parses JSON safely, rejects malformed messages, and forwards each accepted sensor value.'],
      ['Duplicates and outages', 'QoS does not create exactly-once database writes. Include a message ID or deterministic `(device_id, timestamp, sensor)` key, retry only safe operations, and log rejected or duplicate messages.']
    ],
    code: shared.mqtt + '\\n\\n# Raspberry Pi subscriber (Python)\\n' + shared.piMqtt,
    output: 'ESP32 publishes a JSON message, the Pi prints an accepted record, FastAPI returns success, and the dashboard shows a fresh value.',
    troubleshooting: [['Subscriber receives no messages', 'Check broker host from the Pi, topic spelling, credentials, ACLs, and firewall.'], ['Duplicate database rows', 'Add idempotency before retrying HTTP requests.'], ['Pi forwards but API rejects', 'Inspect the response body and compare payload fields with `/docs`.']],
    check: { question: 'What prevents a retry from creating duplicate rows?', options: ['Idempotency or a unique message key', 'Higher screen resolution', 'A different chart color'], answer: 0, explanation: 'Deduplication belongs at the application/database boundary.' },
    summary: 'The Pi is a gateway: it translates secure MQTT events into authenticated API operations while preserving validation and observability.',
    resources: [{ label: 'Paho MQTT Python client', url: 'https://eclipse.dev/paho/index.php?page=clients/python/index.php' }],
    video: videos.piMqtt
  }
]

export const lessonBySlug = Object.fromEntries(detailedLessons.map(lesson => [lesson.slug, lesson]))
