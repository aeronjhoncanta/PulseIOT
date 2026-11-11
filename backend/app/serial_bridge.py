import json
import logging
import os
import time

import paho.mqtt.client as mqtt
import serial

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("pulse-serial-bridge")

SERIAL_PORT = os.getenv("SERIAL_PORT", "/dev/ttyUSB0")
SERIAL_BAUD = int(os.getenv("SERIAL_BAUD", "115200"))
MQTT_HOST = os.getenv("MQTT_HOST", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USERNAME = os.environ["MQTT_USERNAME"]
MQTT_PASSWORD = os.environ["MQTT_PASSWORD"]


def run() -> None:
    while True:
        try:
            logger.info("Opening ESP32 serial port %s at %s baud", SERIAL_PORT, SERIAL_BAUD)
            with serial.Serial(SERIAL_PORT, SERIAL_BAUD, timeout=1) as serial_port:
                client = mqtt.Client(
                    mqtt.CallbackAPIVersion.VERSION2,
                    client_id="pulse-serial-bridge",
                )
                client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
                client.connect(MQTT_HOST, MQTT_PORT, 30)
                client.loop_start()
                logger.info("USB serial bridge connected to MQTT at %s:%s", MQTT_HOST, MQTT_PORT)
                try:
                    while True:
                        line = serial_port.readline()
                        if not line:
                            continue
                        try:
                            payload = json.loads(line.decode("utf-8").strip())
                            device_id = payload["device_id"]
                            if not any(
                                key in payload
                                for key in ("temperature_c", "mq_raw", "distance_cm")
                            ):
                                continue
                            topic = f"iot/devices/{device_id}/telemetry"
                            result = client.publish(topic, json.dumps(payload), qos=1)
                            result.wait_for_publish()
                            if result.rc != mqtt.MQTT_ERR_SUCCESS:
                                raise RuntimeError(f"MQTT publish failed with code {result.rc}")
                            logger.info("Forwarded USB telemetry for %s", device_id)
                        except (UnicodeDecodeError, json.JSONDecodeError, KeyError, TypeError) as exc:
                            logger.warning("Ignoring invalid ESP32 serial line: %s", exc)
                finally:
                    client.loop_stop()
                    client.disconnect()
        except (OSError, serial.SerialException, RuntimeError) as exc:
            logger.error("USB serial bridge unavailable: %s", exc)
            time.sleep(3)


if __name__ == "__main__":
    run()
