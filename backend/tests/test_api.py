import os
from datetime import datetime, timedelta, timezone
os.environ["DATABASE_URL"] = "sqlite:///./backend-test.db"

from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine, SessionLocal
from app.seed import seed_database
from app.models import DeviceModel, ReadingModel
from sqlalchemy.exc import IntegrityError

Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
seed_database()

client = TestClient(app)


def token() -> str:
    response = client.post("/api/auth/login", json={"username": "admin", "password": "pulse-demo"})
    assert response.status_code == 200
    return response.json()["access_token"]


def test_health_is_public():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_authentication_protects_devices():
    assert client.get("/api/devices").status_code == 401
    response = client.get("/api/devices", headers={"Authorization": f"Bearer {token()}"})
    assert response.status_code == 200
    assert len(response.json()) >= 4


def test_device_lifecycle():
    headers = {"Authorization": f"Bearer {token()}"}
    created = client.post("/api/devices", headers=headers, json={"name": "Test node", "type": "ESP32", "location": "Lab"})
    assert created.status_code == 201
    device_id = created.json()["id"]
    updated = client.patch(f"/api/devices/{device_id}", headers=headers, json={"status": "Maintenance"})
    assert updated.status_code == 200
    assert updated.json()["status"] == "Maintenance"
    assert client.delete(f"/api/devices/{device_id}", headers=headers).status_code == 204
    assert client.get(f"/api/devices/{device_id}", headers=headers).status_code == 404


def test_validation_and_alert_update():
    headers = {"Authorization": f"Bearer {token()}"}
    assert client.post("/api/devices", headers=headers, json={"name": "x"}).status_code == 422
    updated = client.patch("/api/alerts/ALT-001", headers=headers, json={"state": "acknowledged"})
    assert updated.status_code == 200
    assert updated.json()["state"] == "acknowledged"


def test_persistence_and_historical_time_filter():
    headers = {"Authorization": f"Bearer {token()}"}
    created = client.post("/api/devices", headers=headers, json={"name": "Persistent node", "type": "ESP32", "location": "Lab"})
    assert created.status_code == 201
    device_id = created.json()["id"]
    with SessionLocal() as db:
        db.add(ReadingModel(sensor="Temperature", device_id=device_id, value=19.25, unit="°C", recorded_at=datetime.now(timezone.utc) - timedelta(days=2)))
        db.commit()
        assert db.get(DeviceModel, device_id) is not None
    start = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    response = client.get("/api/readings/history", params={"device_id": device_id, "start": start}, headers=headers)
    assert response.status_code == 200
    assert response.json() == []


def test_reading_requires_existing_device():
    with SessionLocal() as db:
        db.add(ReadingModel(sensor="Temperature", device_id="missing-device", value=1, unit="°C", recorded_at=datetime.now(timezone.utc)))
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
        else:
            raise AssertionError("foreign key constraint was not enforced")


def test_authenticated_reading_ingestion():
    headers = {"Authorization": f"Bearer {token()}"}
    response = client.post("/api/readings", headers=headers, json={
        "sensor": "temperature",
        "device_id": "ESP-0421",
        "value": 24.5,
        "unit": "C",
        "recorded_at": datetime.now(timezone.utc).isoformat(),
    })
    assert response.status_code == 201
    assert response.json()["value"] == 24.5
