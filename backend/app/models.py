from datetime import datetime
from decimal import Decimal
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
from .schemas import AlertSeverity, AlertState, DeviceStatus


class UserModel(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    password_salt: Mapped[str] = mapped_column(String(64))
    role: Mapped[str] = mapped_column(String(30), default="operator")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class DeviceModel(Base):
    __tablename__ = "devices"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    type: Mapped[str] = mapped_column(String(50))
    location: Mapped[str] = mapped_column(String(120))
    status: Mapped[DeviceStatus] = mapped_column(Enum(DeviceStatus, name="device_status"))
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    image: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    readings: Mapped[list["ReadingModel"]] = relationship(back_populates="device", cascade="all, delete-orphan")
    alerts: Mapped[list["AlertModel"]] = relationship(back_populates="device")


class ReadingModel(Base):
    __tablename__ = "sensor_readings"
    id: Mapped[int] = mapped_column(primary_key=True)
    sensor: Mapped[str] = mapped_column(String(80), index=True)
    device_id: Mapped[str] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    value: Mapped[Decimal] = mapped_column(Numeric(18, 6))
    unit: Mapped[str] = mapped_column(String(20))
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    device: Mapped[DeviceModel] = relationship(back_populates="readings")
    __table_args__ = (Index("ix_readings_device_time", "device_id", "recorded_at"),)


class AlertModel(Base):
    __tablename__ = "alerts"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    severity: Mapped[AlertSeverity] = mapped_column(Enum(AlertSeverity, name="alert_severity"))
    title: Mapped[str] = mapped_column(String(200))
    device_id: Mapped[str] = mapped_column(ForeignKey("devices.id", ondelete="RESTRICT"), index=True)
    location: Mapped[str] = mapped_column(String(120))
    state: Mapped[AlertState] = mapped_column(Enum(AlertState, name="alert_state"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    device: Mapped[DeviceModel] = relationship(back_populates="alerts")


class SensorThresholdModel(Base):
    __tablename__ = "sensor_thresholds"
    sensor: Mapped[str] = mapped_column(String(80), primary_key=True)
    warning: Mapped[Decimal] = mapped_column(Numeric(18, 6))
    critical: Mapped[Decimal] = mapped_column(Numeric(18, 6))
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    condition: Mapped[str] = mapped_column(String(10), default="above")


class SystemLogModel(Base):
    __tablename__ = "system_logs"
    id: Mapped[int] = mapped_column(primary_key=True)
    level: Mapped[str] = mapped_column(String(20))
    message: Mapped[str] = mapped_column(Text)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)


class DeviceStatusHistoryModel(Base):
    __tablename__ = "device_status_history"
    id: Mapped[int] = mapped_column(primary_key=True)
    device_id: Mapped[str] = mapped_column(ForeignKey("devices.id", ondelete="CASCADE"), index=True)
    status: Mapped[DeviceStatus] = mapped_column(Enum(DeviceStatus, name="device_status"))
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
