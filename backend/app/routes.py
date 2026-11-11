import csv
import io
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from .database import get_db
from .models import AlertModel, DeviceModel, SensorThresholdModel
from .repository import repository, to_alert
from .schemas import Alert, AlertStatusUpdate, DashboardStats, Device, DeviceCreate, DeviceUpdate, Esp32Telemetry, Reading, ReadingCreate, Threshold, LoginRequest, TokenResponse
from .security import authenticate, logout, require_auth

router = APIRouter(prefix="/api")


@router.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(select(1))
        return {"status": "ok", "service": "pulse-iot-api", "storage": "postgresql", "mqtt": "configured"}
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc


@router.post("/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return authenticate(db, payload)


@router.post("/auth/logout")
def logout_route(token: str = Depends(require_auth)):
    logout(token)
    return {"status": "logged_out"}


@router.get("/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(_: str = Depends(require_auth), db: Session = Depends(get_db)):
    return repository.stats(db)


@router.get("/devices", response_model=list[Device])
def list_devices(search: str | None = Query(default=None, max_length=100), _: str = Depends(require_auth), db: Session = Depends(get_db)):
    return repository.list_devices(db, search)


@router.post("/devices", response_model=Device, status_code=201)
def create_device(payload: DeviceCreate, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    return repository.create_device(db, payload)


@router.get("/devices/{device_id}", response_model=Device)
def get_device(device_id: str, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    device = repository.get_device(db, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return Device.model_validate(device, from_attributes=True)


@router.patch("/devices/{device_id}", response_model=Device)
def update_device(device_id: str, payload: DeviceUpdate, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    try:
        return repository.update_device(db, device_id, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Device not found") from exc


@router.delete("/devices/{device_id}", status_code=204)
def delete_device(device_id: str, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    device = repository.get_device(db, device_id)
    if device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    db.delete(device)
    db.commit()


@router.get("/readings/latest", response_model=list[Reading])
def latest_readings(device_id: str | None = None, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    return repository.readings(db, device_id=device_id)


@router.post("/readings", response_model=Reading, status_code=201)
def create_reading(payload: ReadingCreate, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    try:
        return repository.create_reading(db, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Device not found") from exc


@router.post("/telemetry/esp32", response_model=list[Reading], status_code=201)
def create_esp32_telemetry(payload: Esp32Telemetry, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    try:
        return repository.create_esp32_telemetry(db, payload)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Device not found") from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/readings/history", response_model=list[Reading])
def historical_readings(device_id: str | None = None, limit: int = Query(default=50, ge=1, le=500), start: datetime | None = None, end: datetime | None = None, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    return repository.readings(db, device_id=device_id, limit=limit, start=start, end=end)


@router.get("/alerts", response_model=list[Alert])
def list_alerts(_: str = Depends(require_auth), db: Session = Depends(get_db)):
    repository.refresh_stale_devices(db)
    return [to_alert(item) for item in db.scalars(select(AlertModel).order_by(AlertModel.created_at.desc())).all()]


@router.patch("/alerts/{alert_id}", response_model=Alert)
def update_alert(alert_id: str, payload: AlertStatusUpdate, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    alert = db.get(AlertModel, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.state = payload.state
    db.commit()
    db.refresh(alert)
    return to_alert(alert)


@router.get("/settings/thresholds", response_model=list[Threshold])
def list_thresholds(_: str = Depends(require_auth), db: Session = Depends(get_db)):
    return [Threshold.model_validate(item, from_attributes=True) for item in db.scalars(select(SensorThresholdModel)).all()]


@router.put("/settings/thresholds/{sensor}", response_model=Threshold)
def update_threshold(sensor: str, payload: Threshold, _: str = Depends(require_auth), db: Session = Depends(get_db)):
    if payload.sensor != sensor:
        raise HTTPException(status_code=422, detail="Sensor path and payload must match")
    threshold = db.get(SensorThresholdModel, sensor)
    if threshold is None:
        threshold = SensorThresholdModel(sensor=sensor)
        db.add(threshold)
    for key, value in payload.model_dump().items():
        setattr(threshold, key, value)
    db.commit()
    db.refresh(threshold)
    return Threshold.model_validate(threshold, from_attributes=True)


@router.get("/reports/readings.csv")
def export_readings(_: str = Depends(require_auth), db: Session = Depends(get_db)):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["record_type", "sensor", "device_id", "location", "value", "unit", "recorded_at", "severity", "alert_state", "alert_title"])
    readings = repository.readings(db, limit=500)
    devices = {device.id: device for device in db.scalars(select(DeviceModel)).all()}
    for reading in readings:
        device = devices.get(reading.device_id)
        writer.writerow(["reading", reading.sensor, reading.device_id, device.location if device else "", reading.value, reading.unit, reading.recorded_at, "", "", ""])
    for alert in db.scalars(select(AlertModel).order_by(AlertModel.created_at.desc())).all():
        writer.writerow(["alert", "", alert.device_id, alert.location, "", "", alert.created_at, alert.severity.value, alert.state.value, alert.title])
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=sensor-readings.csv"})
