import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import type { ChapterItem, DocumentItem, VariantItem } from "../types/domain";

type ChaptersPageProps = {
  chapters: ChapterItem[];
  documents: DocumentItem[];
  variants: VariantItem[];
  onCreate: (payload: {
    title: string;
    order_index: number;
    argument?: string;
    document_ids: number[];
    variant_ids: number[];
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

function selectedIds(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => Number(value));
}

export function ChaptersPage({ chapters, documents, variants, onCreate, onDelete }: ChaptersPageProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    try {
      await onCreate({
        title: String(formData.get("title") ?? ""),
        order_index: Number(formData.get("order_index") ?? 1),
        argument: String(formData.get("argument") ?? ""),
        document_ids: selectedIds(formData, "document_ids"),
        variant_ids: selectedIds(formData, "variant_ids"),
      });
      form.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="论文结构"
        description="以论文章节为骨架组织研究问题，并把相关文献与异文证据绑定到具体论证位置。"
      />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="paper-texture panel p-5">
          <h2 className="text-base font-semibold text-stone-950">创建章节</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">章节用于承载论证，同时连接其依据的文献与异文。</p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="label">章节标题</span>
              <input className="field mt-1" name="title" required placeholder="如：第一章 今本与简帛文本的章句差异" />
            </label>
            <label className="block">
              <span className="label">排序</span>
              <input className="field mt-1" name="order_index" type="number" min="1" defaultValue="1" />
            </label>
            <label className="block">
              <span className="label">论证要点</span>
              <textarea className="field mt-1 min-h-24" name="argument" />
            </label>

            <fieldset>
              <legend className="label">绑定文献</legend>
              <div className="surface mt-2 max-h-40 space-y-2 overflow-auto p-3">
                {documents.length === 0 ? (
                  <p className="text-sm text-stone-500">暂无文献</p>
                ) : (
                  documents.map((document) => (
                    <label key={document.id} className="flex items-center gap-2 text-sm text-stone-700">
                      <input type="checkbox" name="document_ids" value={document.id} className="h-4 w-4" />
                      <span>{document.title}</span>
                    </label>
                  ))
                )}
              </div>
            </fieldset>

            <fieldset>
              <legend className="label">绑定异文</legend>
              <div className="surface mt-2 max-h-44 space-y-2 overflow-auto p-3">
                {variants.length === 0 ? (
                  <p className="text-sm text-stone-500">暂无异文</p>
                ) : (
                  variants.map((variant) => (
                    <label key={variant.id} className="flex items-center gap-2 text-sm text-stone-700">
                      <input type="checkbox" name="variant_ids" value={variant.id} className="h-4 w-4" />
                      <span>
                        {variant.poem_title} · {variant.variant_type}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </fieldset>

            <button className="button-primary w-full" disabled={submitting}>
              <Plus size={17} />
              {submitting ? "保存中" : "创建章节"}
            </button>
          </div>
        </form>

        <section className="space-y-3">
          {chapters.length === 0 ? (
            <EmptyState title="尚未创建章节" description="章节会把文献和异文连接成论文论证结构。" />
          ) : (
            chapters.map((chapter) => (
              <article key={chapter.id} className="panel elevate-hover p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-stone-500">第 {chapter.order_index} 节点</div>
                    <h2 className="mt-1 text-lg font-semibold text-stone-950">{chapter.title}</h2>
                    {chapter.argument && <p className="mt-3 text-sm leading-6 text-stone-600">{chapter.argument}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="tag">
                        文献 {chapter.documents.length}
                      </span>
                      <span className="tag">
                        异文 {chapter.variants.length}
                      </span>
                    </div>
                  </div>
                  <button className="icon-button shrink-0" onClick={() => onDelete(chapter.id)} title="删除章节">
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </>
  );
}
