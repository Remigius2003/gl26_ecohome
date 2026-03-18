"""
Face seed data — edit this file to add/change objects on any face.

Each face entry is a list of dicts with the keys accepted by SceneObject:
    label    – display name
    geometry – "box" | "sphere" | "cylinder" (ignored when model_url is set)
    color    – hex color, e.g. "#e63946"
    x, y, z  – world position
    movable  – True = player-controlled cube
    model_url (optional) – path to a GLTF/GLB model served by the frontend,
                           e.g. "/models/tree.glb"
                           Drop .glb files in front/public/models/ to use them.

Add as many objects as you like per face.
"""
from sqlalchemy import text as sa_text
from sqlalchemy.orm import Session

from database import engine
from models import SceneObject

# ---------------------------------------------------------------------------
# ✏️  Edit here to change what appears on each face
# ---------------------------------------------------------------------------
FACE_OBJECTS: dict[str, list[dict]] = {
    "top": [
        dict(label="Red Cube", geometry="box", color="#e63946", x= 0, y=1, z= 0, movable=True),
        dict(label="Polytech", geometry="box", color="#4361ee", x=-6, y=1, z=-4, movable=False, path="/education/polytech", subtitle="2021 – 2026"),
        dict(label="TOEIC",    geometry="box", color="#06d6a0", x= 6, y=1, z=-4, movable=False, path="/education/toeic",    subtitle="970 / 980"),
    ],
    "bottom": [
        dict(label="Red Cube",    geometry="box", color="#e63946", x= 0, y=1, z= 0, movable=True),
        dict(label="Skills",      geometry="box", color="#6a4c93", x=-5, y=1, z= 4, movable=False, path="/skills"),
        dict(label="Soft Skills", geometry="box", color="#e76f51", x= 5, y=1, z=-4, movable=False, path="/soft-skills"),
    ],
    "front": [
        dict(label="Red Cube",  geometry="box", color="#e63946", x= 0, y=1, z= 0,  movable=True),
        dict(label="About",     geometry="box", color="#ff9f1c", x=-6, y=1, z= 4,  movable=False, path="/about",    subtitle="about me"),
        dict(label="Contact",   geometry="box", color="#7209b7", x=-6, y=1, z=-4,  movable=False, path="/contact"),
        dict(label="Lectures",  geometry="box", color="#ffd166", x= 6, y=1, z= 14, movable=False, path="/reading"),
        dict(label="IA",        geometry="box", color="#a855f7", x= 6, y=1, z=-4,  movable=False, path="/ai-views", subtitle="views"),
    ],
    "back": [
        dict(label="Red Cube",   geometry="box", color="#e63946", x=0, y=1, z=0, movable=True),
        dict(label="Start Game", geometry="box", color="#06d6a0", x=4, y=1, z=4, movable=False, subtitle="play"),
    ],
    "left": [
        dict(label="Red Cube", geometry="box", color="#e63946", x=0,  y=1, z=0,  movable=True),
        dict(label="VISC",     geometry="box", color="#3a86ff", x=-6, y=1, z=-4, movable=False, path="/experience/visc",    subtitle="Mai – Sept 2025"),
        dict(label="Pyralis",  geometry="box", color="#ff6b35", x= 6, y=1, z=-4, movable=False, path="/experience/pyralis", subtitle="2023"),
    ],
    "right": [
        dict(label="Red Cube",     geometry="box", color="#e63946", x= 0, y=1, z= 0,  movable=True),
        dict(label="Éco App",      geometry="box", color="#2a9d8f", x=-8, y=1, z= 3,  movable=False, path="/projects/eco-app",  subtitle="2026"),
        dict(label="Jeu 3D",       geometry="box", color="#e76f51", x= 0, y=1, z=-6,  movable=False, path="/projects/game-3d",  subtitle="2025"),
        dict(label="Dominion C++", geometry="box", color="#6a4c93", x= 8, y=1, z= 3,  movable=False, path="/projects/dominion", subtitle="2024"),
        dict(label="Audit Cyber",  geometry="box", color="#c1121f", x= 0, y=1, z= 9,  movable=False, path="/projects/cybersec", subtitle="2025"),
        dict(label="NLU",          geometry="box", color="#7b2ff7", x=-8, y=1, z=-6,  movable=False, path="/projects/nlu",      subtitle="2025"),
        dict(label="Portfolio",    geometry="box", color="#4488ff", x= 8, y=1, z=-6,  movable=False, path="/projects/portfolio", subtitle="2026"),
    ],
}


def run(db: Session) -> None:
    """Apply schema migrations, then seed missing faces."""

    # ── Schema migrations ────────────────────────────────────────────────────
    with engine.connect() as conn:
        conn.execute(sa_text(
            "ALTER TABLE scene_objects ADD COLUMN IF NOT EXISTS face VARCHAR NOT NULL DEFAULT 'top'"
        ))
        conn.execute(sa_text(
            "ALTER TABLE scene_objects ADD COLUMN IF NOT EXISTS model_url VARCHAR"
        ))
        conn.execute(sa_text(
            "ALTER TABLE scene_objects ADD COLUMN IF NOT EXISTS path VARCHAR"
        ))
        conn.execute(sa_text(
            "ALTER TABLE scene_objects ADD COLUMN IF NOT EXISTS rx FLOAT NOT NULL DEFAULT 0"
        ))
        conn.execute(sa_text(
            "ALTER TABLE scene_objects ADD COLUMN IF NOT EXISTS ry FLOAT NOT NULL DEFAULT 0"
        ))
        conn.execute(sa_text(
            "ALTER TABLE scene_objects ADD COLUMN IF NOT EXISTS rz FLOAT NOT NULL DEFAULT 0"
        ))
        conn.execute(sa_text(
            "ALTER TABLE scene_objects ADD COLUMN IF NOT EXISTS subtitle VARCHAR"
        ))
        # Heal any NULL rotation values left by earlier raw-SQL inserts
        conn.execute(sa_text("UPDATE scene_objects SET rx=0 WHERE rx IS NULL"))
        conn.execute(sa_text("UPDATE scene_objects SET ry=0 WHERE ry IS NULL"))
        conn.execute(sa_text("UPDATE scene_objects SET rz=0 WHERE rz IS NULL"))
        conn.commit()

    # ── Seed missing faces (ORM — Python defaults applied) ───────────────────
    for face, objects in FACE_OBJECTS.items():
        if db.query(SceneObject).filter(SceneObject.face == face).count() > 0:
            continue
        db.add_all([SceneObject(face=face, **obj) for obj in objects])
    db.commit()

    # ── Upgrade patches (run after ORM seed so fresh DBs are already correct) ─

    # Remove old back face objects (Blog, Gallery) and ensure Start Game exists
    with engine.connect() as conn:
        conn.execute(sa_text("DELETE FROM scene_objects WHERE face='back' AND label IN ('Blog','Gallery')"))
        if not conn.execute(sa_text(
            "SELECT 1 FROM scene_objects WHERE face='back' AND label='Start Game' LIMIT 1"
        )).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects (label, geometry, color, x, y, z, rx, ry, rz, movable, face, subtitle) "
                "VALUES ('Start Game','box','#06d6a0',4,1,4,0,0,0,false,'back','play')"
            ))
        conn.commit()

    # Fix EcoApp subtitle year
    with engine.connect() as conn:
        conn.execute(sa_text("UPDATE scene_objects SET subtitle='2026' WHERE face='right' AND label='Éco App'"))
        conn.commit()

    # Remove legacy objects from front face
    with engine.connect() as conn:
        conn.execute(sa_text("DELETE FROM scene_objects WHERE face='front' AND label='Tree'"))
        conn.execute(sa_text("DELETE FROM scene_objects WHERE face='front' AND label='About'"))
        conn.execute(sa_text("DELETE FROM scene_objects WHERE face='front' AND label='Projects'"))
        conn.commit()

    # Move Lectures to near-edge position and clear subtitles on front profile cubes
    with engine.connect() as conn:
        conn.execute(sa_text(
            "UPDATE scene_objects SET x=6, z=14 WHERE face='front' AND label='Lectures'"
        ))
        conn.execute(sa_text(
            "UPDATE scene_objects SET subtitle=NULL WHERE face='front' AND label IN ('Contact','Lectures')"
        ))
        conn.commit()

    # Add Contact cube if missing (rx/ry/rz explicit)
    with engine.connect() as conn:
        if not conn.execute(sa_text(
            "SELECT 1 FROM scene_objects WHERE face='front' AND label='Contact' LIMIT 1"
        )).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects "
                "(label, geometry, color, x, y, z, rx, ry, rz, movable, face, path, subtitle) "
                "VALUES ('Contact','box','#7209b7',-6,1,-4,0,0,0,false,'front','/contact','links')"
            ))
        conn.commit()

    # Add Lectures cube if missing (rx/ry/rz explicit)
    with engine.connect() as conn:
        if not conn.execute(sa_text(
            "SELECT 1 FROM scene_objects WHERE face='front' AND label='Lectures' LIMIT 1"
        )).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects "
                "(label, geometry, color, x, y, z, rx, ry, rz, movable, face, path, subtitle) "
                "VALUES ('Lectures','box','#ffd166',4,1,5,0,0,0,false,'front','/reading','books')"
            ))
        conn.commit()

    # Replace bottom face sphere/cylinder with boxes
    with engine.connect() as conn:
        conn.execute(sa_text("DELETE FROM scene_objects WHERE face='bottom' AND label IN ('Skills','Timeline') AND geometry != 'box'"))
        if not conn.execute(sa_text("SELECT 1 FROM scene_objects WHERE face='bottom' AND label='Skills' LIMIT 1")).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects (label,geometry,color,x,y,z,rx,ry,rz,movable,face,path,subtitle) "
                "VALUES ('Skills','box','#6a4c93',-5,1,4,0,0,0,false,'bottom','/skills',NULL)"
            ))
        if not conn.execute(sa_text("SELECT 1 FROM scene_objects WHERE face='bottom' AND label='Soft Skills' LIMIT 1")).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects (label,geometry,color,x,y,z,rx,ry,rz,movable,face,path,subtitle) "
                "VALUES ('Soft Skills','box','#e76f51',5,1,-4,0,0,0,false,'bottom','/soft-skills',NULL)"
            ))
        conn.commit()

    # Add About Me cube if missing
    with engine.connect() as conn:
        if not conn.execute(sa_text(
            "SELECT 1 FROM scene_objects WHERE face='front' AND label='About' LIMIT 1"
        )).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects (label,geometry,color,x,y,z,rx,ry,rz,movable,face,path,subtitle) "
                "VALUES ('About','box','#ff9f1c',-6,1,4,0,0,0,false,'front','/about','about me')"
            ))
        conn.commit()

    # Add IA (AI Views) cube if missing
    with engine.connect() as conn:
        if not conn.execute(sa_text(
            "SELECT 1 FROM scene_objects WHERE face='front' AND label='IA' LIMIT 1"
        )).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects "
                "(label, geometry, color, x, y, z, rx, ry, rz, movable, face, path, subtitle) "
                "VALUES ('IA','box','#a855f7',6,1,-4,0,0,0,false,'front','/ai-views','views')"
            ))
        conn.commit()

    # Replace old placeholder objects on right face with project cubes
    with engine.connect() as conn:
        old = conn.execute(sa_text(
            "SELECT 1 FROM scene_objects WHERE face='right' AND movable=false "
            "AND label NOT IN ('Éco App', 'Jeu 3D', 'Dominion C++', 'Audit Cyber', 'NLU') LIMIT 1"
        )).fetchone()
        if old:
            conn.execute(sa_text("DELETE FROM scene_objects WHERE face='right' AND movable=false"))
            conn.execute(sa_text(
                "INSERT INTO scene_objects "
                "(label, geometry, color, x, y, z, rx, ry, rz, movable, face, path, subtitle) VALUES "
                "('Éco App',      'box','#2a9d8f',-8,1, 3,0,0,0,false,'right','/projects/eco-app', '2026'),"
                "('Jeu 3D',       'box','#e76f51', 0,1,-6,0,0,0,false,'right','/projects/game-3d', '2025'),"
                "('Dominion C++', 'box','#6a4c93', 8,1, 3,0,0,0,false,'right','/projects/dominion','2024'),"
                "('Audit Cyber',  'box','#c1121f', 0,1, 9,0,0,0,false,'right','/projects/cybersec','2025'),"
                "('NLU',          'box','#7b2ff7',-8,1,-6,0,0,0,false,'right','/projects/nlu',     '2025')"
            ))
            conn.commit()

    # Add NLU cube if missing (existing DB with right face already correct)
    with engine.connect() as conn:
        if not conn.execute(sa_text(
            "SELECT 1 FROM scene_objects WHERE face='right' AND label='NLU' LIMIT 1"
        )).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects "
                "(label, geometry, color, x, y, z, rx, ry, rz, movable, face, path, subtitle) "
                "VALUES ('NLU','box','#7b2ff7',-8,1,-6,0,0,0,false,'right','/projects/nlu','2025')"
            ))
        conn.commit()

    # Fix Portfolio subtitle year
    with engine.connect() as conn:
        conn.execute(sa_text("UPDATE scene_objects SET subtitle='2026' WHERE face='right' AND label='Portfolio'"))
        conn.commit()

    # Add Portfolio cube if missing
    with engine.connect() as conn:
        if not conn.execute(sa_text(
            "SELECT 1 FROM scene_objects WHERE face='right' AND label='Portfolio' LIMIT 1"
        )).fetchone():
            conn.execute(sa_text(
                "INSERT INTO scene_objects "
                "(label, geometry, color, x, y, z, rx, ry, rz, movable, face, path, subtitle) "
                "VALUES ('Portfolio','box','#4488ff',8,1,-6,0,0,0,false,'right','/projects/portfolio','2026')"
            ))
        conn.commit()
