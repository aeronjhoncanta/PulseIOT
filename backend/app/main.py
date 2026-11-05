from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .seed import seed_database
from .routes import router

app = FastAPI(title=settings.app_name, version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.on_event("startup")
def initialize_seed_data() -> None:
    seed_database()
