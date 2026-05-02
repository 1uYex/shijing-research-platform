import os
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .database import Base, UPLOAD_DIR, engine, get_db
from .models import Chapter, Document, Variant


Base.metadata.create_all(bind=engine)

app = FastAPI(title="诗经文本流变研究支持平台 API")

default_origins = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
] or default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


class VariantCreate(BaseModel):
    poem_title: str = Field(min_length=1)
    received_text: str = Field(min_length=1)
    excavated_text: str = Field(min_length=1)
    variant_type: str = Field(min_length=1)
    explanation: str | None = None


class ChapterCreate(BaseModel):
    title: str = Field(min_length=1)
    order_index: int = 1
    argument: str | None = None
    document_ids: list[int] = Field(default_factory=list)
    variant_ids: list[int] = Field(default_factory=list)


def document_to_dict(document: Document) -> dict:
    return {
        "id": document.id,
        "title": document.title,
        "author": document.author,
        "year": document.year,
        "source_type": document.source_type,
        "notes": document.notes,
        "file_name": document.file_name,
        "file_url": f"/uploads/{Path(document.file_path).name}" if document.file_path else None,
    }


def variant_to_dict(variant: Variant) -> dict:
    return {
        "id": variant.id,
        "poem_title": variant.poem_title,
        "received_text": variant.received_text,
        "excavated_text": variant.excavated_text,
        "variant_type": variant.variant_type,
        "explanation": variant.explanation,
    }


def chapter_to_dict(chapter: Chapter) -> dict:
    return {
        "id": chapter.id,
        "title": chapter.title,
        "order_index": chapter.order_index,
        "argument": chapter.argument,
        "documents": [document_to_dict(document) for document in chapter.documents],
        "variants": [variant_to_dict(variant) for variant in chapter.variants],
    }


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/stats")
def get_stats(db: Session = Depends(get_db)) -> dict:
    return {
        "documents": db.query(Document).count(),
        "variants": db.query(Variant).count(),
        "chapters": db.query(Chapter).count(),
    }


@app.get("/documents")
def list_documents(db: Session = Depends(get_db)) -> list[dict]:
    documents = db.scalars(select(Document).order_by(Document.id.desc())).all()
    return [document_to_dict(document) for document in documents]


@app.post("/documents")
async def create_document(
    title: str = Form(...),
    author: str | None = Form(None),
    year: str | None = Form(None),
    source_type: str | None = Form(None),
    notes: str | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
) -> dict:
    file_name = None
    file_path = None
    if file and file.filename:
        safe_suffix = Path(file.filename).suffix
        stored_name = f"{uuid4().hex}{safe_suffix}"
        target = UPLOAD_DIR / stored_name
        target.write_bytes(await file.read())
        file_name = file.filename
        file_path = str(target)

    document = Document(
        title=title,
        author=author,
        year=year,
        source_type=source_type,
        notes=notes,
        file_name=file_name,
        file_path=file_path,
    )
    db.add(document)
    db.commit()
    db.refresh(document)
    return document_to_dict(document)


@app.delete("/documents/{document_id}")
def delete_document(document_id: int, db: Session = Depends(get_db)) -> dict:
    document = db.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if document.file_path:
        path = Path(document.file_path)
        if path.exists():
            path.unlink()
    db.delete(document)
    db.commit()
    return {"ok": True}


@app.get("/variants")
def list_variants(db: Session = Depends(get_db)) -> list[dict]:
    variants = db.scalars(select(Variant).order_by(Variant.id.desc())).all()
    return [variant_to_dict(variant) for variant in variants]


@app.post("/variants")
def create_variant(payload: VariantCreate, db: Session = Depends(get_db)) -> dict:
    variant = Variant(**payload.model_dump())
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant_to_dict(variant)


@app.delete("/variants/{variant_id}")
def delete_variant(variant_id: int, db: Session = Depends(get_db)) -> dict:
    variant = db.get(Variant, variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    db.delete(variant)
    db.commit()
    return {"ok": True}


@app.get("/chapters")
def list_chapters(db: Session = Depends(get_db)) -> list[dict]:
    chapters = db.scalars(
        select(Chapter)
        .options(selectinload(Chapter.documents), selectinload(Chapter.variants))
        .order_by(Chapter.order_index.asc(), Chapter.id.asc())
    ).all()
    return [chapter_to_dict(chapter) for chapter in chapters]


@app.post("/chapters")
def create_chapter(payload: ChapterCreate, db: Session = Depends(get_db)) -> dict:
    documents = db.scalars(select(Document).where(Document.id.in_(payload.document_ids))).all()
    variants = db.scalars(select(Variant).where(Variant.id.in_(payload.variant_ids))).all()
    chapter = Chapter(
        title=payload.title,
        order_index=payload.order_index,
        argument=payload.argument,
        documents=list(documents),
        variants=list(variants),
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter_to_dict(chapter)


@app.delete("/chapters/{chapter_id}")
def delete_chapter(chapter_id: int, db: Session = Depends(get_db)) -> dict:
    chapter = db.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    db.delete(chapter)
    db.commit()
    return {"ok": True}


@app.get("/overview")
def get_overview(db: Session = Depends(get_db)) -> list[dict]:
    chapters = db.scalars(
        select(Chapter)
        .options(selectinload(Chapter.documents), selectinload(Chapter.variants))
        .order_by(Chapter.order_index.asc(), Chapter.id.asc())
    ).all()
    return [chapter_to_dict(chapter) for chapter in chapters]
