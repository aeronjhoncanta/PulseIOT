"""add threshold direction for sensor alerts

Revision ID: 0002_sensor_threshold_condition
Revises: 0001_initial_schema
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_sensor_threshold_condition"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("sensor_thresholds", sa.Column("condition", sa.String(10), nullable=False, server_default="above"))


def downgrade():
    op.drop_column("sensor_thresholds", "condition")
