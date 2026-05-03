import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BookOpen, GitBranch, Layers3, Network } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import type { ChapterItem, DocumentItem, VariantItem } from "../types/domain";

type OverviewPageProps = {
  chapters: ChapterItem[];
};

type SelectedNode =
  | { type: "chapter"; id: number }
  | { type: "document"; id: number }
  | { type: "variant"; id: number };

function uniqueById<T extends { id: number }>(items: T[]) {
  const seen = new Map<number, T>();
  items.forEach((item) => seen.set(item.id, item));
  return Array.from(seen.values());
}

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function nodeKey(node: SelectedNode) {
  return `${node.type}:${node.id}`;
}

function isSelected(selected: SelectedNode, type: SelectedNode["type"], id: number) {
  return selected.type === type && selected.id === id;
}

function NodeButton({
  active,
  related,
  dimmed,
  title,
  meta,
  details,
  onClick,
}: {
  active: boolean;
  related: boolean;
  dimmed: boolean;
  title: string;
  meta: string;
  details?: string[];
  onClick: () => void;
}) {
  const nodeClass = active
    ? "border-[#0f172a] bg-gradient-to-br from-[#111827] via-[#243145] to-[#314f60] text-white shadow-[0_0_0_4px_rgba(49,79,96,0.16),0_18px_34px_rgba(15,23,42,0.22)]"
    : related
      ? "border-[#334155] bg-gradient-to-br from-[#f8fafc] to-[#eef3f2] text-[#111827] shadow-[0_10px_22px_rgba(51,65,85,0.12)]"
      : dimmed
        ? "border-[#cbd5e1] bg-[#f7f7f2] text-slate-600 opacity-55"
        : "border-[#a8a29e] bg-white/80 text-[#1F2937] shadow-sm";

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition duration-200 ${active ? "" : "hover:-translate-y-0.5 hover:border-[#475569] hover:bg-[#fffaf2]"} ${nodeClass}`}
    >
      <div className="text-sm font-bold leading-5">{title}</div>
      <div className={`mt-2 text-xs leading-5 ${active ? "text-white/80" : related ? "text-slate-600" : "text-slate-500"}`}>{meta}</div>
      {details && details.length > 0 && (
        <div className={`mt-3 space-y-1 text-xs leading-5 ${active ? "text-white/75" : related ? "text-slate-700" : "text-slate-500"}`}>
          {details.map((detail) => (
            <div key={detail}>{detail}</div>
          ))}
        </div>
      )}
    </button>
  );
}

export function OverviewPage({ chapters }: OverviewPageProps) {
  const documents = useMemo(() => uniqueById(chapters.flatMap((chapter) => chapter.documents)), [chapters]);
  const variants = useMemo(() => uniqueById(chapters.flatMap((chapter) => chapter.variants)), [chapters]);
  const [selected, setSelected] = useState<SelectedNode>(() => ({ type: "chapter", id: chapters[0]?.id ?? 0 }));

  useEffect(() => {
    const selectedExists =
      selected.type === "chapter"
        ? chapters.some((chapter) => chapter.id === selected.id)
        : selected.type === "document"
          ? documents.some((document) => document.id === selected.id)
          : variants.some((variant) => variant.id === selected.id);

    if (!selectedExists && chapters.length > 0) {
      setSelected({ type: "chapter", id: chapters[0].id });
    }
  }, [chapters, documents, selected, variants]);

  const selectedChapter = selected.type === "chapter" ? chapters.find((chapter) => chapter.id === selected.id) : null;
  const selectedDocument =
    selected.type === "document" ? documents.find((document) => document.id === selected.id) : null;
  const selectedVariant = selected.type === "variant" ? variants.find((variant) => variant.id === selected.id) : null;

  const relatedChapterIds = new Set<number>();
  const relatedDocumentIds = new Set<number>();
  const relatedVariantIds = new Set<number>();

  if (selectedChapter) {
    relatedChapterIds.add(selectedChapter.id);
    selectedChapter.documents.forEach((document) => relatedDocumentIds.add(document.id));
    selectedChapter.variants.forEach((variant) => relatedVariantIds.add(variant.id));
  }

  if (selectedDocument) {
    chapters
      .filter((chapter) => chapter.documents.some((document) => document.id === selectedDocument.id))
      .forEach((chapter) => relatedChapterIds.add(chapter.id));
    relatedDocumentIds.add(selectedDocument.id);
  }

  if (selectedVariant) {
    chapters
      .filter((chapter) => chapter.variants.some((variant) => variant.id === selectedVariant.id))
      .forEach((chapter) => relatedChapterIds.add(chapter.id));
    relatedVariantIds.add(selectedVariant.id);
  }

  const relatedChapters = chapters.filter((chapter) => relatedChapterIds.has(chapter.id));
  const relatedDocuments = documents.filter((document) => relatedDocumentIds.has(document.id));
  const relatedVariants = variants.filter((variant) => relatedVariantIds.has(variant.id));
  const hasSelection = selected.id > 0;
  const relationCount = chapters.reduce(
    (count, chapter) => count + chapter.documents.length + chapter.variants.length,
    0,
  );

  function selectNode(next: SelectedNode) {
    setSelected(next);
  }

  function renderDetail() {
    if (selectedChapter) {
      return (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-stone-950">
            <Layers3 size={17} />
            {selectedChapter.title}
          </div>
          {selectedChapter.argument && (
            <p className="mt-3 text-sm leading-6 text-stone-600">{selectedChapter.argument}</p>
          )}
          <EvidenceChain
            title="证据链说明"
            lines={[
              `该章节由 ${selectedChapter.documents.length} 条文献和 ${selectedChapter.variants.length} 条异文共同支撑。`,
              selectedChapter.documents.length
                ? `文献依据包括：${selectedChapter.documents.map((document) => document.title).join("；")}。`
                : "尚未绑定文献依据。",
              selectedChapter.variants.length
                ? `异文证据包括：${selectedChapter.variants.map((variant) => variant.poem_title).join("；")}。`
                : "尚未绑定异文证据。",
            ]}
          />
          <RelationList title="文献支撑" items={selectedChapter.documents} empty="该章节尚未绑定文献" kind="document" />
          <RelationList title="异文证据" items={selectedChapter.variants} empty="该章节尚未绑定异文" kind="variant" />
        </>
      );
    }

    if (selectedDocument) {
      return (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-stone-950">
            <BookOpen size={17} />
            {selectedDocument.title}
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            {[selectedDocument.material_type, selectedDocument.author, selectedDocument.year].filter(Boolean).join(" · ") ||
              "未填写作者、年代或类型"}
          </p>
          <EvidenceChain
            title="证据链说明"
            lines={[
              `该文献当前支撑 ${relatedChapters.length} 个论文章节。`,
              relatedChapters.length
                ? `相关章节包括：${relatedChapters.map((chapter) => chapter.title).join("；")}。`
                : "尚未被任何章节绑定。",
              selectedDocument.citation_format
                ? `参考文献格式：${selectedDocument.citation_format}`
                : "尚未填写规范参考文献格式。",
            ]}
          />
          <ChapterLinks title="支撑的论文章节" chapters={relatedChapters} />
        </>
      );
    }

    if (selectedVariant) {
      return (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-stone-950">
            <GitBranch size={17} />
            {selectedVariant.poem_title}
          </div>
          <div className="mt-3 rounded-2xl border border-stone-200/70 bg-[#f8faf7] p-3 text-sm leading-6 text-stone-700 shadow-sm">
            <p>传世：{selectedVariant.received_text}</p>
            <p className="mt-2">出土：{selectedVariant.excavated_text}</p>
          </div>
          {selectedVariant.explanation && (
            <p className="mt-3 text-sm leading-6 text-stone-600">{selectedVariant.explanation}</p>
          )}
          <EvidenceChain
            title="证据链说明"
            lines={[
              `该异文当前作为 ${relatedChapters.length} 个章节的证据。`,
              relatedChapters.length
                ? `进入的论证部分包括：${relatedChapters.map((chapter) => chapter.title).join("；")}。`
                : "尚未被任何章节绑定。",
              [
                selectedVariant.source_material && `来源材料：${selectedVariant.source_material}`,
                selectedVariant.region && `地域：${selectedVariant.region}`,
                selectedVariant.period && `时代：${selectedVariant.period}`,
                selectedVariant.confidence_level && `可信度：${selectedVariant.confidence_level}`,
              ]
                .filter(Boolean)
                .join("；") || "来源、地域、时代和可信度信息尚未完整填写。",
            ]}
          />
          <ChapterLinks title="关联的论证部分" chapters={relatedChapters} />
        </>
      );
    }

    return <p className="text-sm text-stone-500">请选择一个节点查看关系。</p>;
  }

  return (
    <>
      <PageHeader
        title="关系总览"
        description="把论文写作中隐含的文献支撑关系显式化：章节提出论证，文献提供依据，异文提供材料证据。"
      />
      {chapters.length === 0 ? (
        <EmptyState title="暂无关系数据" description="创建章节并绑定文献、异文后，这里会生成关联视图。" />
      ) : (
        <div className="space-y-5">
          <section className="panel grid gap-3 p-4 md:grid-cols-4">
            <Metric label="章节节点" value={chapters.length} />
            <Metric label="文献节点" value={documents.length} />
            <Metric label="异文节点" value={variants.length} />
            <Metric label="关系边" value={relationCount} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="paper-texture rounded-2xl border border-[#c8d1d6] bg-[#f8faf7]/82 p-5 shadow-[0_20px_48px_rgba(51,65,85,0.1)] backdrop-blur">
              <div className="relative z-[1] mb-4 flex flex-col gap-3 border-b border-[#c8d1d6] pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-stone-950">
                  <Network size={17} />
                  章节—文献—异文关系网络
                </div>
                <Legend />
              </div>
              <div className="relative z-[1] grid gap-4 lg:grid-cols-[1fr_90px_1fr_90px_1fr]">
                <NodeColumn title="章节节点" icon={<Layers3 size={16} />}>
                  {chapters.map((chapter) => (
                    <NodeButton
                      key={chapter.id}
                      active={isSelected(selected, "chapter", chapter.id)}
                      related={relatedChapterIds.has(chapter.id)}
                      dimmed={hasSelection && !relatedChapterIds.has(chapter.id)}
                      title={chapter.title}
                      meta={`章节 ${chapter.order_index} · 文献 ${chapter.documents.length} · 异文 ${chapter.variants.length}`}
                      details={chapter.argument ? [truncateText(chapter.argument, 48)] : undefined}
                      onClick={() => selectNode({ type: "chapter", id: chapter.id })}
                    />
                  ))}
                </NodeColumn>

                <RelationRail
                  label="支撑"
                  active={selected.type === "chapter" ? relatedDocuments.length > 0 : selected.type === "document"}
                />

                <NodeColumn title="文献节点" icon={<BookOpen size={16} />}>
                  {documents.length === 0 ? (
                    <MutedBox>暂无已绑定文献</MutedBox>
                  ) : (
                    documents.map((document) => (
                      <NodeButton
                        key={document.id}
                        active={isSelected(selected, "document", document.id)}
                        related={relatedDocumentIds.has(document.id)}
                        dimmed={hasSelection && !relatedDocumentIds.has(document.id)}
                        title={document.title}
                        meta={document.material_type || document.source_type || "文献"}
                        details={[
                          [document.author, document.year].filter(Boolean).join(" · ") || "作者、年份未填写",
                          document.publication ? `来源：${document.publication}` : "来源未填写",
                        ]}
                        onClick={() => selectNode({ type: "document", id: document.id })}
                      />
                    ))
                  )}
                </NodeColumn>

                <RelationRail
                  label="证明"
                  active={selected.type === "chapter" ? relatedVariants.length > 0 : selected.type === "variant"}
                />

                <NodeColumn title="异文节点" icon={<GitBranch size={16} />}>
                  {variants.length === 0 ? (
                    <MutedBox>暂无已绑定异文</MutedBox>
                  ) : (
                    variants.map((variant) => (
                      <NodeButton
                        key={variant.id}
                        active={isSelected(selected, "variant", variant.id)}
                        related={relatedVariantIds.has(variant.id)}
                        dimmed={hasSelection && !relatedVariantIds.has(variant.id)}
                        title={variant.poem_title}
                        meta={variant.variant_type}
                        details={[
                          variant.source_material ? `来源：${variant.source_material}` : "来源未填写",
                          [variant.region, variant.period].filter(Boolean).join(" · ") || "地域、时代未填写",
                          variant.confidence_level ? `可信度：${variant.confidence_level}` : "可信度未填写",
                        ]}
                        onClick={() => selectNode({ type: "variant", id: variant.id })}
                      />
                    ))
                  )}
                </NodeColumn>
              </div>
            </div>

            <aside className="panel p-5 shadow-[0_20px_48px_rgba(67,56,43,0.1)]">
              <div className="mb-4 rounded-xl border border-[#d7c7aa]/70 bg-[#fffaf2]/72 px-3 py-2 text-xs font-semibold tracking-normal text-stone-500">
                当前选择 · {nodeKey(selected)}
              </div>
              {renderDetail()}
            </aside>
          </section>
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface elevate-hover p-4">
      <div className="text-xs font-semibold text-stone-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-stone-950">{value}</div>
    </div>
  );
}

function NodeColumn({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-full border border-stone-200/80 bg-white/62 px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm">
        {icon}
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function RelationRail({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="hidden items-start justify-center pt-12 lg:flex">
      <div
        className={`w-full rounded-xl border px-2 py-3 text-center transition duration-200 ${
          active ? "border-[#475569] bg-gradient-to-r from-[#e7edf0] to-[#f4efe5] shadow-sm" : "border-[#CBD5E1] bg-white/58 opacity-65"
        }`}
      >
        <div className={`mx-auto w-full rounded-full transition-all ${active ? "h-1.5 bg-gradient-to-r from-[#334155] via-[#57534e] to-[#8a6f3c]" : "h-0.5 bg-[#CBD5E1]"}`} />
        <div className={`mt-2 text-xs font-semibold ${active ? "text-[#1F2937]" : "text-slate-500"}`}>{label}</div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-2 text-xs text-slate-600">
      <LegendItem
        label="当前选中节点"
        className="border-[#111827] bg-[#1F2937] shadow-[0_0_0_3px_rgba(17,24,39,0.12)]"
      />
      <LegendItem label="关联节点" className="border-[#1F2937] bg-[#E5E7EB]" />
      <LegendItem label="弱化节点" className="border-[#CBD5E1] bg-[#F8FAFC] opacity-60" />
    </div>
  );
}

function LegendItem({ label, className }: { label: string; className: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#CBD5E1] bg-white/78 px-2 py-1 shadow-sm">
      <span className={`h-3 w-5 rounded-sm border ${className}`} />
      <span>{label}</span>
    </div>
  );
}

function EvidenceChain({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#c8d1d6] bg-gradient-to-br from-[#f8fafc] to-[#fffaf2] p-4 shadow-sm">
      <div className="text-xs font-semibold tracking-normal text-[#57534e]">{title}</div>
      <div className="mt-2 space-y-2 text-sm leading-6 text-stone-700">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function MutedBox({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-dashed border-stone-300 bg-white/62 p-3 text-sm text-stone-500">{children}</div>;
}

function RelationList({
  title,
  items,
  empty,
  kind,
}: {
  title: string;
  items: Array<DocumentItem | VariantItem>;
  empty: string;
  kind: "document" | "variant";
}) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold tracking-normal text-stone-500">{title}</div>
      <div className="mt-2 space-y-2">
        {items.length === 0 ? (
          <p className="rounded-xl bg-[#f8faf7] p-3 text-sm text-stone-500">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={`${kind}-${item.id}`} className="rounded-xl border border-stone-200/70 bg-[#f8faf7] p-3 shadow-sm">
              <div className="text-sm font-semibold text-stone-900">
                {kind === "document" ? (item as DocumentItem).title : (item as VariantItem).poem_title}
              </div>
              <div className="mt-1 text-xs text-stone-500">
                {kind === "document"
                  ? [
                      (item as DocumentItem).material_type || (item as DocumentItem).source_type,
                      (item as DocumentItem).author,
                      (item as DocumentItem).year,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "文献"
                  : [
                      (item as VariantItem).source_material,
                      (item as VariantItem).region,
                      (item as VariantItem).period,
                      `可信度：${(item as VariantItem).confidence_level || "未填写"}`,
                    ]
                      .filter(Boolean)
                      .join(" · ") || (item as VariantItem).variant_type}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ChapterLinks({ title, chapters }: { title: string; chapters: ChapterItem[] }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold tracking-normal text-stone-500">{title}</div>
      <div className="mt-2 space-y-2">
        {chapters.length === 0 ? (
          <p className="rounded-xl bg-[#f8faf7] p-3 text-sm text-stone-500">暂无章节引用</p>
        ) : (
          chapters.map((chapter) => (
            <div key={chapter.id} className="rounded-xl border border-stone-200/70 bg-[#f8faf7] p-3 shadow-sm">
              <div className="text-sm font-semibold text-stone-900">{chapter.title}</div>
              {chapter.argument && <p className="mt-2 text-xs leading-5 text-stone-600">{chapter.argument}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
