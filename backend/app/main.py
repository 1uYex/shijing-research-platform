import os
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import Literal

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .database import Base, UPLOAD_DIR, engine, get_db
from .models import Chapter, Document, Variant


Base.metadata.create_all(bind=engine)


def ensure_document_columns() -> None:
    columns = {
        "publication": "VARCHAR(255)",
        "volume_issue": "VARCHAR(120)",
        "pages": "VARCHAR(120)",
        "identifier": "VARCHAR(255)",
        "citation_format": "TEXT",
        "material_type": "VARCHAR(120)",
        "reliability_note": "TEXT",
    }
    with engine.begin() as connection:
        existing_columns = {
            row[1] for row in connection.exec_driver_sql("PRAGMA table_info(documents)").fetchall()
        }
        for column_name, column_type in columns.items():
            if column_name not in existing_columns:
                connection.exec_driver_sql(f"ALTER TABLE documents ADD COLUMN {column_name} {column_type}")


def ensure_variant_columns() -> None:
    columns = {
        "source_material": "VARCHAR(255)",
        "slip_or_page": "VARCHAR(255)",
        "received_version": "VARCHAR(255)",
        "region": "VARCHAR(120)",
        "period": "VARCHAR(120)",
        "evidence_note": "TEXT",
        "confidence_level": "VARCHAR(20)",
    }
    with engine.begin() as connection:
        existing_columns = {
            row[1] for row in connection.exec_driver_sql("PRAGMA table_info(variants)").fetchall()
        }
        for column_name, column_type in columns.items():
            if column_name not in existing_columns:
                connection.exec_driver_sql(f"ALTER TABLE variants ADD COLUMN {column_name} {column_type}")


ensure_document_columns()
ensure_variant_columns()

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
    source_material: str | None = None
    slip_or_page: str | None = None
    received_version: str | None = None
    region: str | None = None
    period: str | None = None
    evidence_note: str | None = None
    confidence_level: Literal["高", "中", "低"] | None = "中"


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
        "publication": document.publication,
        "volume_issue": document.volume_issue,
        "pages": document.pages,
        "identifier": document.identifier,
        "citation_format": document.citation_format,
        "material_type": document.material_type,
        "reliability_note": document.reliability_note,
    }


def variant_to_dict(variant: Variant) -> dict:
    return {
        "id": variant.id,
        "poem_title": variant.poem_title,
        "received_text": variant.received_text,
        "excavated_text": variant.excavated_text,
        "variant_type": variant.variant_type,
        "explanation": variant.explanation,
        "source_material": variant.source_material,
        "slip_or_page": variant.slip_or_page,
        "received_version": variant.received_version,
        "region": variant.region,
        "period": variant.period,
        "evidence_note": variant.evidence_note,
        "confidence_level": variant.confidence_level,
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


@app.post("/seed-demo")
def seed_demo(db: Session = Depends(get_db)) -> dict:
    document_specs = [
        {
            "title": "【示例数据】《毛诗正义》校读参考",
            "author": "孔颖达等",
            "year": "唐",
            "source_type": "传世文献",
            "material_type": "传世文献",
            "publication": "示例来源：十三经注疏系统",
            "citation_format": "【示例数据】孔颖达等. 毛诗正义[M]. 示例参考格式，非真实研究结论.",
            "notes": "【示例数据】用于展示传世文献如何支撑章节论证。",
            "reliability_note": "【示例数据】仅用于系统演示，不代表具体版本判断。",
        },
        {
            "title": "【示例数据】安大简《诗经》材料整理",
            "author": "示例整理者",
            "year": "战国材料 / 现代整理",
            "source_type": "出土材料",
            "material_type": "出土文献整理",
            "publication": "示例来源：安徽大学藏战国竹简整理材料",
            "citation_format": "【示例数据】示例整理者. 安大简《诗经》材料整理[M]. 示例参考格式，非真实研究结论.",
            "notes": "【示例数据】用于展示出土材料与异文证据的关联。",
            "reliability_note": "【示例数据】简号、释读均为演示占位。",
        },
        {
            "title": "【示例数据】阜阳汉简《诗经》残简研究",
            "author": "示例研究者",
            "year": "西汉材料 / 现代研究",
            "source_type": "出土材料",
            "material_type": "出土文献整理",
            "publication": "示例来源：阜阳汉简研究资料",
            "citation_format": "【示例数据】示例研究者. 阜阳汉简《诗经》残简研究[J]. 示例期刊, 2026(1): 1-12.",
            "notes": "【示例数据】用于展示汉简材料进入论文结构的方式。",
            "reliability_note": "【示例数据】仅用于答辩演示。",
        },
    ]

    documents: dict[str, Document] = {}
    created_documents = 0
    for spec in document_specs:
        document = db.scalar(select(Document).where(Document.title == spec["title"]))
        if not document:
            document = Document(**spec)
            db.add(document)
            created_documents += 1
        documents[spec["title"]] = document

    variant_specs = [
        {
            "poem_title": "【示例数据】周南·关雎",
            "received_text": "关关雎鸠，在河之洲。",
            "excavated_text": "关关雎鸠，在河之州。",
            "variant_type": "字形差异",
            "explanation": "【示例数据】展示“洲/州”异文如何进入文本流变讨论。",
            "source_material": "安大简",
            "slip_or_page": "示例简号：简一二",
            "received_version": "毛诗正义",
            "region": "楚地",
            "period": "战国",
            "evidence_note": "【示例数据】释读依据为演示占位，不代表真实考释。",
            "confidence_level": "中",
        },
        {
            "poem_title": "【示例数据】周南·关雎",
            "received_text": "窈窕淑女，君子好逑。",
            "excavated_text": "窈窕淑女，君子好仇。",
            "variant_type": "通假",
            "explanation": "【示例数据】展示通假关系如何作为论证证据。",
            "source_material": "阜阳汉简",
            "slip_or_page": "示例页码：第8页",
            "received_version": "毛诗正义",
            "region": "中原",
            "period": "西汉",
            "evidence_note": "【示例数据】用于说明同音近义或通假分析的记录方式。",
            "confidence_level": "低",
        },
        {
            "poem_title": "【示例数据】召南·驺虞",
            "received_text": "彼茁者葭，壹发五豝。",
            "excavated_text": "彼茁者葭，一发五豝。",
            "variant_type": "字形差异",
            "explanation": "【示例数据】展示数字用字差异。",
            "source_material": "安大简",
            "slip_or_page": "示例简号：简二一",
            "received_version": "毛诗正义",
            "region": "楚地",
            "period": "战国",
            "evidence_note": "【示例数据】仅用于关系网络演示。",
            "confidence_level": "中",
        },
        {
            "poem_title": "【示例数据】召南·驺虞",
            "received_text": "于嗟乎驺虞。",
            "excavated_text": "吁嗟乎驺虞。",
            "variant_type": "句读差异",
            "explanation": "【示例数据】展示语气词差异对句读和训释的影响。",
            "source_material": "阜阳汉简",
            "slip_or_page": "示例残片：FYS-03",
            "received_version": "毛诗正义",
            "region": "中原",
            "period": "西汉",
            "evidence_note": "【示例数据】残片位置与释读均为演示。",
            "confidence_level": "低",
        },
        {
            "poem_title": "【示例数据】卫风·硕人",
            "received_text": "硕人其颀，衣锦褧衣。",
            "excavated_text": "硕人其颀，衣锦絅衣。",
            "variant_type": "字形差异",
            "explanation": "【示例数据】展示服饰相关用字异文。",
            "source_material": "安大简",
            "slip_or_page": "示例简号：简三六",
            "received_version": "毛诗正义",
            "region": "楚地",
            "period": "战国",
            "evidence_note": "【示例数据】用于展示异文与章节论证的绑定。",
            "confidence_level": "中",
        },
    ]

    variants: dict[str, Variant] = {}
    created_variants = 0
    for spec in variant_specs:
        variant = db.scalar(
            select(Variant).where(
                Variant.poem_title == spec["poem_title"],
                Variant.received_text == spec["received_text"],
                Variant.excavated_text == spec["excavated_text"],
            )
        )
        if not variant:
            variant = Variant(**spec)
            db.add(variant)
            created_variants += 1
        variants[f"{spec['poem_title']}::{spec['received_text']}"] = variant

    db.flush()

    chapter_specs = [
        {
            "title": "【示例数据】第一章 《关雎》异文与传世文本关系",
            "order_index": 1,
            "argument": "【示例数据】展示《关雎》相关异文如何由《毛诗正义》和简帛材料共同支撑。",
            "document_titles": [
                "【示例数据】《毛诗正义》校读参考",
                "【示例数据】安大简《诗经》材料整理",
                "【示例数据】阜阳汉简《诗经》残简研究",
            ],
            "variant_keys": [
                "【示例数据】周南·关雎::关关雎鸠，在河之洲。",
                "【示例数据】周南·关雎::窈窕淑女，君子好逑。",
            ],
        },
        {
            "title": "【示例数据】第二章 《驺虞》篇章用字与句读问题",
            "order_index": 2,
            "argument": "【示例数据】展示《驺虞》数字用字和语气词差异如何形成论证链。",
            "document_titles": [
                "【示例数据】《毛诗正义》校读参考",
                "【示例数据】安大简《诗经》材料整理",
                "【示例数据】阜阳汉简《诗经》残简研究",
            ],
            "variant_keys": [
                "【示例数据】召南·驺虞::彼茁者葭，壹发五豝。",
                "【示例数据】召南·驺虞::于嗟乎驺虞。",
            ],
        },
        {
            "title": "【示例数据】第三章 《硕人》异文与服饰训释",
            "order_index": 3,
            "argument": "【示例数据】展示《硕人》用字异文如何关联出土材料和传世注疏。",
            "document_titles": [
                "【示例数据】《毛诗正义》校读参考",
                "【示例数据】安大简《诗经》材料整理",
            ],
            "variant_keys": [
                "【示例数据】卫风·硕人::硕人其颀，衣锦褧衣。",
            ],
        },
    ]

    created_chapters = 0
    for spec in chapter_specs:
        chapter = db.scalar(select(Chapter).where(Chapter.title == spec["title"]))
        if not chapter:
            chapter = Chapter(
                title=spec["title"],
                order_index=spec["order_index"],
                argument=spec["argument"],
            )
            db.add(chapter)
            created_chapters += 1
        chapter.documents = [documents[title] for title in spec["document_titles"] if title in documents]
        chapter.variants = [variants[key] for key in spec["variant_keys"] if key in variants]

    db.commit()
    return {
        "ok": True,
        "created": {
            "documents": created_documents,
            "variants": created_variants,
            "chapters": created_chapters,
        },
        "message": "示例数据导入完成。所有示例内容均以【示例数据】标注，不代表真实研究结论。",
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
    publication: str | None = Form(None),
    volume_issue: str | None = Form(None),
    pages: str | None = Form(None),
    identifier: str | None = Form(None),
    citation_format: str | None = Form(None),
    material_type: str | None = Form(None),
    reliability_note: str | None = Form(None),
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
        publication=publication,
        volume_issue=volume_issue,
        pages=pages,
        identifier=identifier,
        citation_format=citation_format,
        material_type=material_type,
        reliability_note=reliability_note,
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
