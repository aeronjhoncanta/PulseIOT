from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field


class DeviceStatus(str, Enum):
    online = "Online"
    offline = "Offline"
    maintenance = "Maintenance"


class AlertSeverity(str, Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class AlertState(str, Enum):
    open = "open"
    acknowledged = "acknowledged"
    resolved = "resolved"


class DeviceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    type: str = Field(min_length=2, max_length=50)
    location: str = Field(min_length=2, max_length=120)


class DeviceUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    type: str | None = Field(default=None, min_length=2, max_length=50)
    location: str | None = Field(default=None, min_length=2, max_length=120)
    status: DeviceStatus | None = None


class Device(DeviceCreate):
    model_config = ConfigDict(from_attributes=True)
    id: str
    status: DeviceStatus
    last_seen: datetime
    image: str


class Reading(BaseModel):
    sensor: str
    device_id: str
    value: float
    unit: str
    recorded_at: datetime


class ReadingCreate(BaseModel):
    sensor: str = Field(min_length=1, max_length=80)
    device_id: str = Field(min_length=1, max_length=40)
    value: float
    unit: str = Field(min_length=1, max_length=20)
    recorded_at: datetime


class Esp32Telemetry(BaseModel):
    device_id: str = Field(min_length=1, max_length=40)
    temperature_c: float | None = Field(default=None, ge=-55, le=125)
    mq_raw: int | None = Field(default=None, ge=0, le=4095)
    distance_cm: float | None = Field(default=None, ge=2, le=400)
    recorded_at_ms: int | None = Field(default=None, ge=0)


class Alert(BaseModel):
    id: str
    severity: AlertSeverity
    title: str
    device_id: str
    location: str
    state: AlertState
    created_at: datetime


class AlertStatusUpdate(BaseModel):
    state: AlertState


class Threshold(BaseModel):
    sensor: str
    warning: float
    critical: float
    enabled: bool = True
    condition: str = "above"


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DashboardStats(BaseModel):
    total_devices: int
    online_devices: int
    active_sensors: int
    unresolved_alerts: int
    uptime_percent: float


class HealthResponse(BaseModel):
    status: str
    service: str
    storage: str
    mqtt: str
