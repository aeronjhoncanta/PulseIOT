from datetime import datetime, timedelta, timezone
from uuid import uuid4
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session
from .models import AlertModel, DeviceModel, DeviceStatusHistoryModel, ReadingModel, SensorThresholdModel
from .schemas import Alert, AlertSeverity, AlertState, DashboardStats, Device, DeviceCreate, DeviceStatus, DeviceUpdate, Esp32Telemetry, Reading, ReadingCreate, Threshold


def now() -> datetime:
    return datetime.now(timezone.utc)


def to_device(model: DeviceModel) -> Device:
    return Device.model_validate(model, from_attributes=True)


def to_reading(model: ReadingModel) -> Reading:
    return Reading(sensor=model.sensor, device_id=model.device_id, value=float(model.value), unit=model.unit, recorded_at=model.recorded_at)


def to_alert(model: AlertModel) -> Alert:
    return Alert.model_validate(model, from_attributes=True)


class Repository:
    stale_after = timedelta(seconds=20)

    def refresh_stale_devices(self, db: Session) -> None:
        cutoff = now() - self.stale_after
        devices = db.scalars(select(DeviceModel).where(DeviceModel.status == DeviceStatus.online, DeviceModel.last_seen < cutoff)).all()
        for device in devices:
            device.status = DeviceStatus.offline
            db.add(DeviceStatusHistoryModel(device_id=device.id, status=device.status))
            self._ensure_alert(db, device, AlertSeverity.critical, f"{device.name} offline")
        if devices:
            db.commit()

    def _ensure_alert(self, db: Session, device: DeviceModel, severity: AlertSeverity, title: str) -> None:
        existing = db.scalar(select(AlertModel).where(
            AlertModel.device_id == device.id,
            AlertModel.title == title,
            AlertModel.state != AlertState.resolved,
        ))
        if existing is None:
            db.add(AlertModel(
                id=f"ALT-{uuid4().hex[:8].upper()}",
                severity=severity,
                title=title,
                device_id=device.id,
                location=device.location,
                state=AlertState.open,
            ))

    def _apply_threshold(self, db: Session, device: DeviceModel, sensor: str, value: float) -> None:
        threshold = db.get(SensorThresholdModel, sensor)
        if threshold is None or not threshold.enabled:
            return
        exceeds_warning = value >= float(threshold.warning) if threshold.condition == "above" else value <= float(threshold.warning)
        exceeds_critical = value >= float(threshold.critical) if threshold.condition == "above" else value <= float(threshold.critical)
        if not exceeds_warning:
            return
        severity = AlertSeverity.critical if exceeds_critical else AlertSeverity.warning
        self._ensure_alert(db, device, severity, f"{sensor} threshold exceeded ({value:g})")

    def list_devices(self, db: Session, query: str | None = None) -> list[Device]:
        self.refresh_stale_devices(db)
        statement = select(DeviceModel).order_by(DeviceModel.created_at)
        if query:
            needle = f"%{query}%"
            statement = statement.where(or_(DeviceModel.id.ilike(needle), DeviceModel.name.ilike(needle), DeviceModel.type.ilike(needle), DeviceModel.location.ilike(needle)))
        return [to_device(item) for item in db.scalars(statement).all()]

    def get_device(self, db: Session, device_id: str) -> DeviceModel | None:
        return db.get(DeviceModel, device_id)

    def create_device(self, db: Session, payload: DeviceCreate) -> Device:
        device = DeviceModel(id=f"DEV-{uuid4().hex[:8].upper()}", status=DeviceStatus.online, last_seen=now(), image="https://images.unsplash.com/photo-1518770660439-4636190af475", **payload.model_dump())
        db.add(device)
        db.add(DeviceStatusHistoryModel(device_id=device.id, status=device.status))
        db.commit()
        db.refresh(device)
        return to_device(device)

    def ensure_esp32_device(self, db: Session) -> None:
        if self.get_device(db, "esp32-sensor-01") is not None:
            return
        device = DeviceModel(
            id="esp32-sensor-01",
            name="ESP32 Multi-Sensor",
            type="ESP32",
            location="Sensor lab",
            status=DeviceStatus.offline,
            last_seen=now(),
            image="https://images.unsplash.com/photo-1553406830-ef2513450d76",
        )
        db.add(device)
        db.add(DeviceStatusHistoryModel(device_id=device.id, status=device.status))
        db.commit()

    def update_device(self, db: Session, device_id: str, payload: DeviceUpdate) -> Device:
        device = self.get_device(db, device_id)
        if device is None:
            raise KeyError(device_id)
        old_status = device.status
        for key, value in payload.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(device, key, value)
        if device.status != old_status:
            db.add(DeviceStatusHistoryModel(device_id=device.id, status=device.status))
        db.commit()
        db.refresh(device)
        return to_device(device)

    def readings(self, db: Session, device_id: str | None = None, limit: int = 50, start: datetime | None = None, end: datetime | None = None) -> list[Reading]:
        statement = select(ReadingModel).order_by(ReadingModel.recorded_at.desc()).limit(limit)
        if device_id:
            statement = statement.where(ReadingModel.device_id == device_id)
        if start:
            statement = statement.where(ReadingModel.recorded_at >= start)
        if end:
            statement = statement.where(ReadingModel.recorded_at <= end)
        return [to_reading(item) for item in db.scalars(statement).all()]

    def create_reading(self, db: Session, payload: ReadingCreate) -> Reading:
        device = self.get_device(db, payload.device_id)
        if device is None:
            raise KeyError(payload.device_id)
        if device.status == DeviceStatus.offline:
            device.status = DeviceStatus.online
            db.add(DeviceStatusHistoryModel(device_id=device.id, status=device.status))
        device.last_seen = now()
        reading = ReadingModel(**payload.model_dump())
        db.add(reading)
        self._apply_threshold(db, device, payload.sensor, payload.value)
        db.commit()
        db.refresh(reading)
        return to_reading(reading)

    def create_esp32_telemetry(self, db: Session, payload: Esp32Telemetry) -> list[Reading]:
        device = self.get_device(db, payload.device_id)
        if device is None:
            raise KeyError(payload.device_id)
        recorded_at = now()
        values = (
            ("Temperature", payload.temperature_c, "°C"),
            ("MQ raw", payload.mq_raw, "raw"),
            ("Distance", payload.distance_cm, "cm"),
        )
        readings = []
        device.last_seen = recorded_at
        if device.status != DeviceStatus.online:
            device.status = DeviceStatus.online
            db.add(DeviceStatusHistoryModel(device_id=device.id, status=device.status))
        for sensor, value, unit in values:
            if value is None:
                continue
            reading = ReadingModel(sensor=sensor, device_id=device.id, value=value, unit=unit, recorded_at=recorded_at)
            db.add(reading)
            readings.append(reading)
            self._apply_threshold(db, device, sensor, float(value))
        if not readings:
            raise ValueError("Telemetry contains no valid sensor readings")
        db.commit()
        for reading in readings:
            db.refresh(reading)
        return [to_reading(reading) for reading in readings]

    def stats(self, db: Session) -> DashboardStats:
        self.refresh_stale_devices(db)
        total = db.scalar(select(func.count()).select_from(DeviceModel)) or 0
        online = db.scalar(select(func.count()).select_from(DeviceModel).where(DeviceModel.status == DeviceStatus.online)) or 0
        active = db.scalar(select(func.count(func.distinct(ReadingModel.sensor)))) or 0
        unresolved = db.scalar(select(func.count()).select_from(AlertModel).where(AlertModel.state != AlertState.resolved)) or 0
        return DashboardStats(total_devices=total, online_devices=online, active_sensors=active, unresolved_alerts=unresolved, uptime_percent=round((online / total) * 100, 1) if total else 0)

    def seed(self, db: Session) -> None:
        if db.scalar(select(func.count()).select_from(DeviceModel)):
            return
        seed = [
            ("ESP-0421", "Greenhouse Node A", "ESP32", "North greenhouse", DeviceStatus.online),
            ("RPI-1088", "Edge Gateway 01", "Raspberry Pi 4", "Production floor", DeviceStatus.online),
            ("MKR-7740", "Water Quality Probe", "Arduino MKR", "Reservoir 02", DeviceStatus.offline),
            ("GW-2301", "Industrial Gateway", "Gateway", "Main building", DeviceStatus.online),
        ]
        for device_id, name, kind, location, status in seed:
            db.add(DeviceModel(id=device_id, name=name, type=kind, location=location, status=status, last_seen=now(), image="https://images.unsplash.com/photo-1518770660439-4636190af475"))
        db.flush()
        db.add_all([
            ReadingModel(sensor="Temperature", device_id="ESP-0421", value=23.8, unit="°C", recorded_at=now() - timedelta(seconds=12)),
            ReadingModel(sensor="Humidity", device_id="ESP-0421", value=58.4, unit="%", recorded_at=now() - timedelta(seconds=12)),
            ReadingModel(sensor="Air quality", device_id="RPI-1088", value=42, unit="AQI", recorded_at=now() - timedelta(seconds=28)),
            ReadingModel(sensor="Distance", device_id="GW-2301", value=1.84, unit="m", recorded_at=now() - timedelta(seconds=5)),
        ])
        db.add_all([
            AlertModel(id="ALT-001", severity=AlertSeverity.critical, title="Water Quality Probe offline", device_id="MKR-7740", location="Reservoir 02", state=AlertState.open, created_at=now() - timedelta(minutes=18)),
            AlertModel(id="ALT-002", severity=AlertSeverity.warning, title="Temperature above threshold", device_id="ESP-0421", location="North greenhouse", state=AlertState.open, created_at=now() - timedelta(minutes=42)),
            AlertModel(id="ALT-003", severity=AlertSeverity.info, title="Firmware update available", device_id="GW-2301", location="Main building", state=AlertState.open, created_at=now() - timedelta(hours=2)),
        ])
        db.add_all([
            SensorThresholdModel(sensor="Temperature", warning=28, critical=32),
            SensorThresholdModel(sensor="Humidity", warning=75, critical=90),
            SensorThresholdModel(sensor="Air quality", warning=100, critical=150),
            SensorThresholdModel(sensor="MQ raw", warning=2500, critical=3500),
            SensorThresholdModel(sensor="Distance", warning=10, critical=5, condition="below"),
        ])
        db.commit()


repository = Repository()
