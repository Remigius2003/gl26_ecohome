from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, Float, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
import os

# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------
DB_URL = os.environ["DB_URL"]

engine = create_engine(DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)


class SceneObject(Base):
    __tablename__ = "scene_objects"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, nullable=False)
    geometry = Column(String, nullable=False)  # box | sphere | cylinder
    color = Column(String, nullable=False)     # hex e.g. #e63946
    x = Column(Float, default=0.0)
    y = Column(Float, default=0.0)
    z = Column(Float, default=0.0)
    movable = Column(Boolean, default=False)
    face = Column(String, nullable=False, default="top")  # top|bottom|front|back|left|right


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------
_FACE_PROPS = {
    "top":    {"sphere": ("#457b9d", ( 5, 1.2,  3)), "cylinder": ("#2a9d8f", (-4, 1.5, -3))},
    "bottom": {"sphere": ("#6a4c93", (-3, 1.2,  4)), "cylinder": ("#e76f51", ( 4, 1.5, -2))},
    "front":  {"sphere": ("#f4a261", ( 6, 1.2, -2)), "cylinder": ("#264653", (-2, 1.5,  5))},
    "back":   {"sphere": ("#e9c46a", (-5, 1.2, -4)), "cylinder": ("#a8dadc", ( 3, 1.5,  2))},
    "left":   {"sphere": ("#2ec4b6", ( 4, 1.2,  5)), "cylinder": ("#e71d36", (-3, 1.5, -4))},
    "right":  {"sphere": ("#ff9f1c", (-6, 1.2,  2)), "cylinder": ("#4cc9f0", ( 2, 1.5, -5))},
}


def _seed(db: Session) -> None:
    from sqlalchemy import text as sa_text
    # Add face column if upgrading from old schema
    with engine.connect() as conn:
        conn.execute(sa_text(
            "ALTER TABLE scene_objects ADD COLUMN IF NOT EXISTS face VARCHAR NOT NULL DEFAULT 'top'"
        ))
        conn.commit()

    for face, props in _FACE_PROPS.items():
        if db.query(SceneObject).filter(SceneObject.face == face).count() > 0:
            continue
        sc, (sx, sy, sz) = props["sphere"]
        cc, (cx, cy, cz) = props["cylinder"]
        db.add_all([
            SceneObject(label="Red Cube",   geometry="box",      color="#e63946", x=0,  y=1,  z=0,  movable=True,  face=face),
            SceneObject(label="Sphere",     geometry="sphere",   color=sc,        x=sx, y=sy, z=sz, movable=False, face=face),
            SceneObject(label="Cylinder",   geometry="cylinder", color=cc,        x=cx, y=cy, z=cz, movable=False, face=face),
        ])
    db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        _seed(db)
    finally:
        db.close()
    yield


app = FastAPI(lifespan=lifespan)


# ---------------------------------------------------------------------------
# Dependency
# ---------------------------------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class UserCreate(BaseModel):
    name: str
    email: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


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

    model_config = {"from_attributes": True}


class SceneObjectMove(BaseModel):
    x: float
    z: float


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@app.get("/api/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/users", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(name=payload.name, email=payload.email)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.delete("/api/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()


@app.get("/api/objects", response_model=list[SceneObjectOut])
def list_objects(face: str = "top", db: Session = Depends(get_db)):
    return db.query(SceneObject).filter(SceneObject.face == face).all()


@app.patch("/api/objects/{object_id}/position", response_model=SceneObjectOut)
def move_object(object_id: int, payload: SceneObjectMove, db: Session = Depends(get_db)):
    obj = db.get(SceneObject, object_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Object not found")
    obj.x = payload.x
    obj.z = payload.z
    db.commit()
    db.refresh(obj)
    return obj
