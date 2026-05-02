import { FormEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import type { VariantItem } from "../types/domain";

type VariantsPageProps = {
  variants: VariantItem[];
  onCreate: (payload: Omit<VariantItem, "id">) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export function VariantsPage({ variants, onCreate, onDelete }: VariantsPageProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      poem_title: String(formData.get("poem_title") ?? ""),
      received_text: String(formData.get("received_text") ?? ""),
      excavated_text: String(formData.get("excavated_text") ?? ""),
      variant_type: String(formData.get("variant_type") ?? ""),
      explanation: String(formData.get("explanation") ?? ""),
    };
    setSubmitting(true);
    try {
      await onCreate(payload);
      form.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="异文数据"
        description="记录篇目、传世文本与出土文本之间的差异，把零散异文整理为可绑定、可说明的文本证据。"
      />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="panel p-5">
          <h2 className="text-base font-semibold text-stone-950">录入异文</h2>
          <p className="mt-1 text-sm leading-6 text-stone-500">一条异文就是一个可被章节论证引用的证据单元。</p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="label">篇目</span>
              <input className="field mt-1" name="poem_title" required placeholder="如：周南·关雎" />
            </label>
            <label className="block">
              <span className="label">传世文本</span>
              <textarea className="field mt-1 min-h-24" name="received_text" required />
            </label>
            <label className="block">
              <span className="label">出土文本</span>
              <textarea className="field mt-1 min-h-24" name="excavated_text" required />
            </label>
            <label className="block">
              <span className="label">异文类型</span>
              <select className="field mt-1" name="variant_type" defaultValue="字形差异">
                <option>字形差异</option>
                <option>通假</option>
                <option>脱衍</option>
                <option>语序差异</option>
                <option>句读差异</option>
                <option>其他</option>
              </select>
            </label>
            <label className="block">
              <span className="label">说明</span>
              <textarea className="field mt-1 min-h-24" name="explanation" />
            </label>
            <button className="button-primary w-full" disabled={submitting}>
              <Plus size={17} />
              {submitting ? "保存中" : "添加异文"}
            </button>
          </div>
        </form>

        <section className="space-y-3">
          {variants.length === 0 ? (
            <EmptyState title="尚未录入异文" description="异文会作为章节论证中的核心材料被引用。" />
          ) : (
            variants.map((variant) => (
              <article key={variant.id} className="panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-stone-950">{variant.poem_title}</h2>
                      <span className="tag">
                        {variant.variant_type}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="surface p-3">
                        <div className="label">传世文本</div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">{variant.received_text}</p>
                      </div>
                      <div className="surface p-3">
                        <div className="label">出土文本</div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">{variant.excavated_text}</p>
                      </div>
                    </div>
                    {variant.explanation && (
                      <p className="mt-3 text-sm leading-6 text-stone-600">{variant.explanation}</p>
                    )}
                  </div>
                  <button className="icon-button shrink-0" onClick={() => onDelete(variant.id)} title="删除异文">
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
