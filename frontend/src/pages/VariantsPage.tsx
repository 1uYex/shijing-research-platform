import { FormEvent, useMemo, useState } from "react";
import { Plus, Search, Trash2, X } from "lucide-react";
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
  const [filters, setFilters] = useState({
    keyword: "",
    source_material: "",
    region: "",
    period: "",
    variant_type: "",
    confidence_level: "",
  });

  const filterOptions = useMemo(
    () => ({
      source_material: uniqueOptions(variants.map((variant) => variant.source_material)),
      region: uniqueOptions(variants.map((variant) => variant.region)),
      period: uniqueOptions(variants.map((variant) => variant.period)),
      variant_type: uniqueOptions(variants.map((variant) => variant.variant_type)),
      confidence_level: uniqueOptions(variants.map((variant) => variant.confidence_level)),
    }),
    [variants],
  );

  const filteredVariants = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return variants.filter((variant) => {
      const keywordMatched =
        !keyword ||
        [
          variant.poem_title,
          variant.received_text,
          variant.excavated_text,
          variant.explanation,
          variant.evidence_note,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));

      return (
        keywordMatched &&
        matchesFilter(variant.source_material, filters.source_material) &&
        matchesFilter(variant.region, filters.region) &&
        matchesFilter(variant.period, filters.period) &&
        matchesFilter(variant.variant_type, filters.variant_type) &&
        matchesFilter(variant.confidence_level, filters.confidence_level)
      );
    });
  }, [filters, variants]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      keyword: "",
      source_material: "",
      region: "",
      period: "",
      variant_type: "",
      confidence_level: "",
    });
  }

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
      source_material: String(formData.get("source_material") ?? ""),
      slip_or_page: String(formData.get("slip_or_page") ?? ""),
      received_version: String(formData.get("received_version") ?? ""),
      region: String(formData.get("region") ?? ""),
      period: String(formData.get("period") ?? ""),
      evidence_note: String(formData.get("evidence_note") ?? ""),
      confidence_level: String(formData.get("confidence_level") ?? "中") as "高" | "中" | "低",
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
          <p className="mt-1 text-sm leading-6 text-stone-500">一条异文就是一个可溯源、可考释、可被章节论证引用的证据单元。</p>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">出土材料来源</span>
                <input className="field mt-1" name="source_material" placeholder="如：安大简" />
              </label>
              <label className="block">
                <span className="label">简号 / 页码 / 位置</span>
                <input className="field mt-1" name="slip_or_page" placeholder="如：简三二 / 第45页" />
              </label>
            </div>
            <label className="block">
              <span className="label">对应传世版本</span>
              <input className="field mt-1" name="received_version" placeholder="如：毛诗正义" />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="label">地域属性</span>
                <input className="field mt-1" name="region" placeholder="如：楚地" />
              </label>
              <label className="block">
                <span className="label">时代</span>
                <input className="field mt-1" name="period" placeholder="如：战国" />
              </label>
              <label className="block">
                <span className="label">可信度</span>
                <select className="field mt-1" name="confidence_level" defaultValue="中">
                  <option>高</option>
                  <option>中</option>
                  <option>低</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="label">说明</span>
              <textarea className="field mt-1 min-h-24" name="explanation" />
            </label>
            <label className="block">
              <span className="label">释读依据 / 考释说明</span>
              <textarea className="field mt-1 min-h-24" name="evidence_note" />
            </label>
            <button className="button-primary w-full" disabled={submitting}>
              <Plus size={17} />
              {submitting ? "保存中" : "添加异文"}
            </button>
          </div>
        </form>

        <section className="space-y-3">
          <div className="panel p-5">
            <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-950">异文检索</h2>
                <p className="mt-1 text-sm leading-6 text-stone-500">
                  共 {variants.length} 条，当前显示 {filteredVariants.length} 条
                </p>
              </div>
              <button className="button-secondary shrink-0" onClick={clearFilters} disabled={!hasActiveFilters}>
                <X size={16} />
                清空筛选
              </button>
            </div>
            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="label">关键词搜索</span>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    className="field pl-9"
                    value={filters.keyword}
                    onChange={(event) => updateFilter("keyword", event.target.value)}
                    placeholder="搜索篇目、传世文本、出土文本、说明、释读依据"
                  />
                </div>
              </label>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <FilterSelect
                  label="出土材料来源"
                  value={filters.source_material}
                  options={filterOptions.source_material}
                  onChange={(value) => updateFilter("source_material", value)}
                />
                <FilterSelect
                  label="地域"
                  value={filters.region}
                  options={filterOptions.region}
                  onChange={(value) => updateFilter("region", value)}
                />
                <FilterSelect
                  label="时代"
                  value={filters.period}
                  options={filterOptions.period}
                  onChange={(value) => updateFilter("period", value)}
                />
                <FilterSelect
                  label="异文类型"
                  value={filters.variant_type}
                  options={filterOptions.variant_type}
                  onChange={(value) => updateFilter("variant_type", value)}
                />
                <FilterSelect
                  label="可信度"
                  value={filters.confidence_level}
                  options={filterOptions.confidence_level}
                  onChange={(value) => updateFilter("confidence_level", value)}
                />
              </div>
            </div>
          </div>

          {variants.length === 0 ? (
            <EmptyState title="尚未录入异文" description="异文会作为章节论证中的核心材料被引用。" />
          ) : filteredVariants.length === 0 ? (
            <EmptyState title="没有匹配的异文" description="请调整关键词或筛选条件后再试。" />
          ) : (
            filteredVariants.map((variant) => (
              <article key={variant.id} className="panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-stone-950">{variant.poem_title}</h2>
                      {variant.source_material && <span className="tag">{variant.source_material}</span>}
                      {variant.region && <span className="tag">{variant.region}</span>}
                      {variant.period && <span className="tag">{variant.period}</span>}
                      <span className="tag">
                        {variant.variant_type}
                      </span>
                      {variant.confidence_level && <span className="tag">可信度：{variant.confidence_level}</span>}
                    </div>
                    <div className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
                      <InfoRow label="出土材料" value={variant.source_material} />
                      <InfoRow label="简号 / 页码 / 位置" value={variant.slip_or_page} />
                      <InfoRow label="对应传世版本" value={variant.received_version} />
                      <InfoRow label="地域与时代" value={[variant.region, variant.period].filter(Boolean).join(" · ")} />
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
                    {variant.evidence_note && (
                      <div className="surface mt-3 p-3">
                        <div className="label">释读依据 / 考释说明</div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                          {variant.evidence_note}
                        </p>
                      </div>
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

function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function matchesFilter(value: string | null | undefined, filter: string) {
  return !filter || value === filter;
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field mt-1" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">全部</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="surface p-3">
      <div className="label">{label}</div>
      <div className="mt-1 text-sm text-stone-800">{value || "未填写"}</div>
    </div>
  );
}
