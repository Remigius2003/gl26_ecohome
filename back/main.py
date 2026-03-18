import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends, Request, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from sqlalchemy import func
from database import Base, engine, SessionLocal, get_db
from models import SceneObject, Book
import seed


# ---------------------------------------------------------------------------
# Rate limiter
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address)


# ---------------------------------------------------------------------------
# Lifecycle
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed.run(db)
    finally:
        db.close()
    yield


app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ---------------------------------------------------------------------------
# Admin API key guard
# ---------------------------------------------------------------------------
_ADMIN_KEY = os.environ.get("ADMIN_API_KEY", "")
_api_key_header = APIKeyHeader(name="X-Admin-Key", auto_error=True)


def require_admin(key: str = Security(_api_key_header)):
    if not _ADMIN_KEY or key != _ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Forbidden")


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class SceneObjectOut(BaseModel):
    id: int
    label: str
    geometry: str
    color: str
    x: float
    y: float
    z: float
    movable: bool
    face: str
    model_url: str | None = None
    path:      str | None = None
    rx:        float | None = 0.0
    ry:        float | None = 0.0
    rz:        float | None = 0.0
    subtitle:  str | None = None
    model_config = {"from_attributes": True}


class SceneObjectMove(BaseModel):
    x: float
    z: float


class BookIn(BaseModel):
    title:  str
    author: str = ""


class BookOut(BaseModel):
    id:     int
    title:  str
    author: str = ""
    votes:  int
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}



@app.get("/api/objects", response_model=list[SceneObjectOut])
def list_objects(face: str = "top", db: Session = Depends(get_db)):
    return db.query(SceneObject).filter(SceneObject.face == face).all()


@app.patch("/api/objects/{object_id}/position", response_model=SceneObjectOut,
           dependencies=[Depends(require_admin)])
def move_object(object_id: int, payload: SceneObjectMove, db: Session = Depends(get_db)):
    obj = db.get(SceneObject, object_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    obj.x = payload.x
    obj.z = payload.z
    db.commit()
    db.refresh(obj)
    return obj


@app.get("/api/books", response_model=list[BookOut])
def list_books(db: Session = Depends(get_db)):
    return db.query(Book).order_by(Book.votes.desc()).limit(20).all()


@app.post("/api/books", response_model=BookOut, status_code=201)
@limiter.limit("5/minute")
def recommend_book(request: Request, payload: BookIn, db: Session = Depends(get_db)):
    title = payload.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title required")
    existing = db.query(Book).filter(func.lower(Book.title) == title.lower()).first()
    if existing:
        existing.votes += 1
        db.commit()
        db.refresh(existing)
        return existing
    book = Book(title=title, author=payload.author.strip())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book
