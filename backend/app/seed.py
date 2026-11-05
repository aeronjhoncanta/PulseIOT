from .database import SessionLocal
from .models import UserModel
from .repository import repository
from .security import create_password_hash
from .config import settings
from sqlalchemy import select


def seed_database() -> None:
    with SessionLocal() as db:
        repository.seed(db)
        if db.scalar(select(UserModel).where(UserModel.username == settings.demo_username)) is None:
            password_hash, password_salt = create_password_hash(settings.demo_password)
            db.add(UserModel(username=settings.demo_username, password_hash=password_hash, password_salt=password_salt, role="admin"))
            db.commit()
