import { Download, Plus, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { API_BASE_URL } from "../lib/api";
import type { DocumentItem } from "../types/domain";

type DocumentsPageProps = {
  documents: DocumentItem[];
  onCreate: (formData: FormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function DocumentsPage({ documents, onCreate, onDelete }: DocumentsPageProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    try {
      await onCreate(formData);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="文献库"
        description="集中收录版本文献、考古报告、研究论文与工具书，为后续章节论证提供可追踪的学术依据。"
      />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="panel p-5">
          <h2 className="text-base font-semibold text-stone-950">添加文献</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">记录题名、作者、类型与本地文件，形成可引用的文献节点。</p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="label">题名</span>
              <input className="field mt-1" name="title" required placeholder="如：毛诗正义" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">作者</span>
                <input className="field mt-1" name="author" placeholder="孔颖达" />
              </label>
              <label className="block">
                <span className="label">年代</span>
                <input className="field mt-1" name="year" placeholder="唐 / 1999" />
              </label>
            </div>
            <label className="block">
              <span className="label">类型</span>
              <select className="field mt-1" name="source_type" defaultValue="传世文献">
                <option>传世文献</option>
                <option>出土材料</option>
                <option>现代论文</option>
                <option>专著</option>
                <option>工具书</option>
              </select>
            </label>
            <label className="block">
              <span className="label">说明</span>
              <textarea className="field mt-1 min-h-24" name="notes" placeholder="版本、出处、使用价值等" />
            </label>
            <label className="block">
              <span className="label">本地文件</span>
              <input className="field mt-1" name="file" type="file" />
            </label>
            <button className="button-primary w-full" disabled={submitting}>
              <Plus size={17} />
              {submitting ? "保存中" : "添加文献"}
            </button>
          </div>
        </form>

        <section className="space-y-3">
          {documents.length === 0 ? (
            <EmptyState title="尚未添加文献" description="先录入一条文献，之后可以在论文章节中绑定它。" />
          ) : (
            documents.map((document) => (
              <article key={document.id} className="panel p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-stone-950">{document.title}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
                      {document.author && <span>{document.author}</span>}
                      {document.year && <span>{document.year}</span>}
                      {document.source_type && (
                        <span className="tag">
                          {document.source_type}
                        </span>
                      )}
                    </div>
                    {document.notes && <p className="mt-3 text-sm leading-6 text-stone-600">{document.notes}</p>}
                    {document.file_url && (
                      <a
                        className="button-secondary mt-4"
                        href={`${API_BASE_URL}${document.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download size={16} />
                        {document.file_name ?? "查看文件"}
                      </a>
                    )}
                  </div>
                  <button className="icon-button" onClick={() => onDelete(document.id)} title="删除文献">
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
