"""initial postgres schema

Revision ID: 0001_initial_schema
Revises:
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    device_status = sa.Enum("online", "offline", "maintenance", name="device_status")
    alert_severity = sa.Enum("info", "warning", "critical", name="alert_severity")
    alert_state = sa.Enum("open", "acknowledged", "resolved", name="alert_state")
    device_status.create(op.get_bind(), checkfirst=True)
    alert_severity.create(op.get_bind(), checkfirst=True)
    alert_state.create(op.get_bind(), checkfirst=True)
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("username", sa.String(100), nullable=False, unique=True), sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("password_salt", sa.String(64), nullable=False), sa.Column("role", sa.String(30), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_table("devices", sa.Column("id", sa.String(40), primary_key=True), sa.Column("name", sa.String(100), nullable=False), sa.Column("type", sa.String(50), nullable=False), sa.Column("location", sa.String(120), nullable=False), sa.Column("status", device_status, nullable=False), sa.Column("last_seen", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("image", sa.Text(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_devices_last_seen", "devices", ["last_seen"])
    op.create_table("sensor_readings", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("sensor", sa.String(80), nullable=False), sa.Column("device_id", sa.String(40), sa.ForeignKey("devices.id", ondelete="CASCADE"), nullable=False), sa.Column("value", sa.Numeric(18, 6), nullable=False), sa.Column("unit", sa.String(20), nullable=False), sa.Column("recorded_at", sa.DateTime(timezone=True), nullable=False))
    op.create_index("ix_sensor_readings_device_id", "sensor_readings", ["device_id"])
    op.create_index("ix_sensor_readings_sensor", "sensor_readings", ["sensor"])
    op.create_index("ix_sensor_readings_recorded_at", "sensor_readings", ["recorded_at"])
    op.create_index("ix_readings_device_time", "sensor_readings", ["device_id", "recorded_at"])
    op.create_table("alerts", sa.Column("id", sa.String(40), primary_key=True), sa.Column("severity", alert_severity, nullable=False), sa.Column("title", sa.String(200), nullable=False), sa.Column("device_id", sa.String(40), sa.ForeignKey("devices.id", ondelete="RESTRICT"), nullable=False), sa.Column("location", sa.String(120), nullable=False), sa.Column("state", alert_state, nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()), sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_alerts_device_id", "alerts", ["device_id"])
    op.create_index("ix_alerts_state", "alerts", ["state"])
    op.create_index("ix_alerts_created_at", "alerts", ["created_at"])
    op.create_table("sensor_thresholds", sa.Column("sensor", sa.String(80), primary_key=True), sa.Column("warning", sa.Numeric(18, 6), nullable=False), sa.Column("critical", sa.Numeric(18, 6), nullable=False), sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.create_table("system_logs", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("level", sa.String(20), nullable=False), sa.Column("message", sa.Text(), nullable=False), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_system_logs_created_at", "system_logs", ["created_at"])
    op.create_table("device_status_history", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("device_id", sa.String(40), sa.ForeignKey("devices.id", ondelete="CASCADE"), nullable=False), sa.Column("status", device_status, nullable=False), sa.Column("changed_at", sa.DateTime(timezone=True), server_default=sa.func.now()))
    op.create_index("ix_device_status_history_device_id", "device_status_history", ["device_id"])
    op.create_index("ix_device_status_history_changed_at", "device_status_history", ["changed_at"])


def downgrade():
    op.drop_table("device_status_history")
    op.drop_table("system_logs")
    op.drop_table("sensor_thresholds")
    op.drop_table("alerts")
    op.drop_table("sensor_readings")
    op.drop_table("devices")
    op.drop_table("users")
    sa.Enum(name="alert_state").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="alert_severity").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="device_status").drop(op.get_bind(), checkfirst=True)
