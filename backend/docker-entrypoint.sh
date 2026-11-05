#!/bin/sh
set -eu

python - <<'PY'
import os
import time

from sqlalchemy import create_engine, text

url = os.environ["DATABASE_URL"]
for attempt in range(1, 31):
    try:
        engine = create_engine(url)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        break
    except Exception as exc:
        if attempt == 30:
            raise
        print(f"Waiting for database ({attempt}/30): {exc}", flush=True)
        time.sleep(2)
PY

alembic upgrade head
exec "$@"
