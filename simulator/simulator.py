import json
import math
import os
import random
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt


broker = os.getenv("MQTT_HOST", "mosquitto")
port = int(os.getenv("MQTT_PORT", "1883"))
username = os.environ["MQTT_USERNAME"]
password = os.environ["MQTT_PASSWORD"]
device_id = os.getenv("SIMULATOR_DEVICE_ID", "ESP-0421")
interval = float(os.getenv("SIMULATOR_INTERVAL", "5"))

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id="pulse-simulator")
client.username_pw_set(username, password)

while True:
    try:
        client.connect(broker, port, 30)
        client.loop_start()
        step = 0
        while True:
            timestamp = datetime.now(timezone.utc).isoformat()
            readings = (
                ("Temperature", 23.8 + math.sin(step / 6) * 2 + random.uniform(-0.2, 0.2), "°C"),
                ("Humidity", 58.4 + math.sin(step / 8) * 4 + random.uniform(-0.4, 0.4), "%"),
            )
            for sensor, value, unit in readings:
                payload = {"sensor": sensor, "device_id": device_id, "value": round(value, 3), "unit": unit, "recorded_at": timestamp}
                result = client.publish(f"iot/devices/{device_id}/telemetry", json.dumps(payload), qos=1)
                result.wait_for_publish()
            step += 1
            time.sleep(interval)
    except (OSError, RuntimeError) as exc:
        print(f"MQTT simulator disconnected: {exc}", flush=True)
        time.sleep(3)
    finally:
        client.loop_stop()
        client.disconnect()
