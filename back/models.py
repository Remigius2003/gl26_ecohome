from sqlalchemy import Boolean, Column, Float, Integer, String
from database import Base


class Book(Base):
    __tablename__ = "books"

    id     = Column(Integer, primary_key=True, index=True)
    title  = Column(String,  nullable=False)
    author = Column(String,  nullable=True, default="")
    votes  = Column(Integer, nullable=False, default=1)


class SceneObject(Base):
    __tablename__ = "scene_objects"

    id       = Column(Integer, primary_key=True, index=True)
    label    = Column(String,  nullable=False)
    geometry = Column(String,  nullable=False)   # box | sphere | cylinder
    color    = Column(String,  nullable=False)   # hex e.g. #e63946
    x        = Column(Float,   default=0.0)
    y        = Column(Float,   default=0.0)
    z        = Column(Float,   default=0.0)
    movable   = Column(Boolean, default=False)
    face      = Column(String,  nullable=False, default="top")  # top|bottom|front|back|left|right
    model_url = Column(String,  nullable=True)   # optional GLTF/GLB URL; if set, geometry is ignored
    path      = Column(String,  nullable=True)   # optional route opened when player interacts
    rx        = Column(Float,   default=0.0)     # rotation X in degrees
    ry        = Column(Float,   default=0.0)     # rotation Y in degrees
    rz        = Column(Float,   default=0.0)     # rotation Z in degrees
    subtitle  = Column(String,  nullable=True)   # short secondary text (e.g. year)
