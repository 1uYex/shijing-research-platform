from sqlalchemy import Column, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


chapter_documents = Table(
    "chapter_documents",
    Base.metadata,
    Column("chapter_id", ForeignKey("chapters.id", ondelete="CASCADE"), primary_key=True),
    Column("document_id", ForeignKey("documents.id", ondelete="CASCADE"), primary_key=True),
)

chapter_variants = Table(
    "chapter_variants",
    Base.metadata,
    Column("chapter_id", ForeignKey("chapters.id", ondelete="CASCADE"), primary_key=True),
    Column("variant_id", ForeignKey("variants.id", ondelete="CASCADE"), primary_key=True),
)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    author: Mapped[str | None] = mapped_column(String(255), nullable=True)
    year: Mapped[str | None] = mapped_column(String(64), nullable=True)
    source_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    chapters: Mapped[list["Chapter"]] = relationship(
        secondary=chapter_documents,
        back_populates="documents",
    )


class Variant(Base):
    __tablename__ = "variants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    poem_title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    received_text: Mapped[str] = mapped_column(Text, nullable=False)
    excavated_text: Mapped[str] = mapped_column(Text, nullable=False)
    variant_type: Mapped[str] = mapped_column(String(120), nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)

    chapters: Mapped[list["Chapter"]] = relationship(
        secondary=chapter_variants,
        back_populates="variants",
    )


class Chapter(Base):
    __tablename__ = "chapters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    order_index: Mapped[int] = mapped_column(Integer, default=1)
    argument: Mapped[str | None] = mapped_column(Text, nullable=True)

    documents: Mapped[list[Document]] = relationship(
        secondary=chapter_documents,
        back_populates="chapters",
    )
    variants: Mapped[list[Variant]] = relationship(
        secondary=chapter_variants,
        back_populates="chapters",
    )
