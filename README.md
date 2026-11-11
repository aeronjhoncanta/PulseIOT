# Pulse IoT Operations Console

Full-stack IoT monitoring frontend and FastAPI backend backed by PostgreSQL through SQLAlchemy and Alembic.

## Run locally

### PostgreSQL

Create a private local database and user, then set the connection string (never commit credentials):

```sql
CREATE USER pulse WITH PASSWORD 'change-this-password';
CREATE DATABASE pulse_iot OWNER pulse;
```

```bash
export DATABASE_URL='postgresql+psycopg://pulse:change-this-password@localhost:5432/pulse_iot'
```

### Backend

```bash
uv venv backend/.venv
uv pip install --python backend/.venv/bin/python -r backend/requirements.txt
cd backend && ../backend/.venv/bin/alembic upgrade head && cd ..
PYTHONPATH=backend backend/.venv/bin/uvicorn app.main:app --reload --port 8000
```

Swagger UI is available at `http://localhost:8000/docs`. The development login is `admin` / `pulse-demo`; override these with `DEMO_USERNAME` and `DEMO_PASSWORD`.

### Frontend

```bash
npm install
npm run dev
```

The production frontend uses the same-origin `/api` path through Nginx. For local Vite development, set `VITE_API_URL=http://localhost:8000/api` if the backend is running separately.

## API

Public: `GET /api/health`, `POST /api/auth/login`.

Authenticated bearer-token routes:

- `POST /api/auth/logout`
- `GET /api/dashboard/stats`
- `GET|POST /api/devices`, `GET|PATCH|DELETE /api/devices/{device_id}`
- `GET /api/readings/latest`, `GET /api/readings/history`
- `POST /api/readings` for authenticated hardware/gateway ingestion
- `GET /api/alerts`, `PATCH /api/alerts/{alert_id}`
- `GET /api/settings/thresholds`, `PUT /api/settings/thresholds/{sensor}`
- `GET /api/reports/readings.csv`

Device management, dashboard statistics, readings, alerts, reports, and threshold settings now use the centralized frontend API service in `src/services/api.js`. Learning pages and the quiz remain available independently of backend availability. Failed API calls show an explicit error state rather than silently reverting to sample data.

The database schema includes users/roles, devices, sensor readings, alerts, system logs, device status history, and sensor thresholds. Device and reading relationships use foreign keys and indexed timestamps. Historical readings support `device_id`, `start`, `end`, and bounded `limit` query parameters.

To create a new migration after model changes:

```bash
cd backend
../backend/.venv/bin/alembic revision --autogenerate -m "describe change"
../backend/.venv/bin/alembic upgrade head
```

## Validation

```bash
PYTHONPATH=backend backend/.venv/bin/pytest -q backend/tests
npm run build
```

Tests use an isolated SQLite database and cover authentication, validation, device CRUD, alert persistence, foreign-key-backed readings, and historical time filtering. PostgreSQL is the runtime database.

## Run the complete application with Docker Compose

Docker Compose runs the production React build behind Nginx, FastAPI, PostgreSQL, Mosquitto, an MQTT subscriber, and a telemetry simulator.

```bash
cp .env.example .env
# Replace every replace-with-* value in .env.
docker compose up --build -d
docker compose ps
```

Open `http://localhost` and sign in with `DEMO_USERNAME` and `DEMO_PASSWORD`. The backend container waits for PostgreSQL, runs `alembic upgrade head`, and then starts FastAPI. The simulator publishes temperature and humidity readings for `ESP-0421`; the subscriber persists them in PostgreSQL and they appear in the dashboard.

### ESP32 multi-sensor node

The MQTT subscriber accepts the ESP32 payload on `iot/devices/esp32-sensor-01/telemetry` and stores each valid field as a normalized reading:

- `temperature_c` from DS18B20 on GPIO 4 (`°C`)
- `mq_raw` from the MQ sensor on GPIO 34 (`raw`)
- `distance_cm` from HC-SR04 on GPIO 5/18 (`cm`)

The reference Arduino sketch is [firmware/esp32_multi_sensor/esp32_multi_sensor.ino](./firmware/esp32_multi_sensor/esp32_multi_sensor.ino). It sends JSON telemetry over USB at 115200 baud; it does not require Wi-Fi or MQTT credentials on the ESP32. Upload it with the OneWire, DallasTemperature, and ArduinoJson libraries installed.

Run `docker compose up --build -d` after setting the MQTT credentials in `.env`. The `serial-bridge` service reads `/dev/ttyUSB0` and forwards USB telemetry to the internal MQTT broker. The `esp32-sensor-01` device is created by the seed step, and its status changes online when telemetry arrives or offline after 20 seconds without a reading. Apply migrations with the normal backend startup or `docker compose exec backend alembic upgrade head`.

Useful operations:

```bash
docker compose logs -f backend mqtt-subscriber simulator
docker compose exec backend alembic current
docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose down                 # stop containers, retain named volumes
docker compose down -v              # stop and remove database/MQTT data
```

Nginx serves all client-side routes with an `index.html` fallback, so direct navigation and refreshes such as `/learn/introduction` work. `/api/` is proxied internally to FastAPI and WebSocket upgrade headers are preserved. MQTT and database services are on the private Compose network and are not published to the host.

## Learning Center additions

The Learning Center content is maintained in [src/data/lessons.js](./src/data/lessons.js). It now includes structured objectives, explanations, practical examples, tutorials, code, expected output, troubleshooting, checks, summaries, resources, responsive media, and local progress persistence for:

- IoT fundamentals and original platform topics
- ESP32 introduction, setup, sensors, Wi-Fi, MQTT, and platform integration
- Raspberry Pi introduction, setup, GPIO/sensors
- Raspberry Pi 1 direct sensor project
- Raspberry Pi 2 ESP32/MQTT gateway project

Hardware examples use placeholders and environment variables for credentials. The diagrams are local SVG assets under [src/assets](./src/assets), and videos include direct YouTube links plus an unavailable-video fallback.
