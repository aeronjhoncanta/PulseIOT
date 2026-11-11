import json
import logging
import os
import time
import paho.mqtt.client as mqtt
from pydantic import ValidationError

from .database import SessionLocal
from .repository import repository
from .schemas import Esp32Telemetry, ReadingCreate

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("pulse-mqtt-subscriber")

MQTT_HOST = os.getenv("MQTT_HOST", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USERNAME = os.environ["MQTT_USERNAME"]
MQTT_PASSWORD = os.environ["MQTT_PASSWORD"]
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "iot/devices/+/telemetry")


def on_connect(client: mqtt.Client, _userdata, _flags, reason_code, _properties=None):
    if reason_code != 0:
        logger.error("MQTT connection failed: %s", reason_code)
        return
    client.subscribe(MQTT_TOPIC, qos=1)
    logger.info("Subscribed to %s", MQTT_TOPIC)


def on_message(_client: mqtt.Client, _userdata, message: mqtt.MQTTMessage):
    try:
        raw_payload = json.loads(message.payload)
        payload = Esp32Telemetry.model_validate(raw_payload) if any(key in raw_payload for key in ("temperature_c", "mq_raw", "distance_cm")) else ReadingCreate.model_validate(raw_payload)
    except (json.JSONDecodeError, ValidationError) as exc:
        logger.warning("Ignoring invalid telemetry on %s: %s", message.topic, exc)
        return

    try:
        with SessionLocal() as db:
            if isinstance(payload, Esp32Telemetry):
                repository.create_esp32_telemetry(db, payload)
            else:
                repository.create_reading(db, payload)
    except KeyError:
        logger.warning("Ignoring telemetry for unknown device %s", payload.device_id)
    except Exception:
        logger.exception("Failed to persist telemetry for %s", payload.device_id)


def run() -> None:
    while True:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="pulse-subscriber")
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)
        client.on_connect = on_connect
        client.on_message = on_message
        try:
            logger.info("Connecting to MQTT broker at %s:%s", MQTT_HOST, MQTT_PORT)
            client.connect(MQTT_HOST, MQTT_PORT, 30)
            client.loop_forever()
        except (OSError, RuntimeError) as exc:
            logger.error("MQTT subscriber disconnected: %s", exc)
            time.sleep(3)


if __name__ == "__main__":
    run()
