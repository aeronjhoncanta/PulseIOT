from dataclasses import dataclass
import os


@dataclass(frozen=True)
class Settings:
    app_name: str = "Pulse IoT API"
    cors_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost").split(",")
        if origin.strip()
    )
    demo_username: str = os.getenv("DEMO_USERNAME", "admin")
    demo_password: str = os.getenv("DEMO_PASSWORD", "pulse-demo")


settings = Settings()
