import { Download, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
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
  const [filters, setFilters] = useState({
    keyword: "",
    material_type: "",
    year: "",
    source_type: "",
  });

  const filterOptions = useMemo(
    () => ({
      materialTypes: uniqueOptions(documents.map((document) => document.material_type)),
      years: uniqueOptions(documents.map((document) => document.year)),
      sourceTypes: uniqueOptions(documents.map((document) => document.source_type)),
    }),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return documents.filter((document) => {
      const keywordFields = [
        document.title,
        document.author,
        document.publication,
        document.citation_format,
        document.notes,
      ];
      const matchesKeyword =
        !keyword ||
        keywordFields.some((field) => field?.toLowerCase().includes(keyword));

      return (
        matchesKeyword &&
        matchesFilter(document.material_type, filters.material_type) &&
        matchesFilter(document.year, filters.year) &&
        matchesFilter(document.source_type, filters.source_type)
      );
    });
  }, [documents, filters]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function updateFilter(key: keyof typeof filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setFilters({
      keyword: "",
      material_type: "",
      year: "",
      source_type: "",
    });
  }

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
              <span className="label">文献类型</span>
              <select className="field mt-1" name="material_type" defaultValue="传世文献">
                <option>传世文献</option>
                <option>出土文献整理</option>
                <option>专著</option>
                <option>期刊论文</option>
                <option>工具书</option>
                <option>外文文献</option>
                <option>其他</option>
              </select>
            </label>
            <label className="block">
              <span className="label">刊物 / 出版社 / 来源</span>
              <input className="field mt-1" name="publication" placeholder="如：中华书局 / 文学遗产" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">卷期</span>
                <input className="field mt-1" name="volume_issue" placeholder="如：2024年第3期" />
              </label>
              <label className="block">
                <span className="label">页码</span>
                <input className="field mt-1" name="pages" placeholder="如：45-58" />
              </label>
            </div>
            <label className="block">
              <span className="label">DOI / ISBN / CNKI / 检索标识</span>
              <input className="field mt-1" name="identifier" />
            </label>
            <label className="block">
              <span className="label">规范参考文献格式</span>
              <textarea className="field mt-1 min-h-24" name="citation_format" placeholder="如：作者. 题名[J]. 刊物, 年份(期): 页码." />
            </label>
            <label className="block">
              <span className="label">说明</span>
              <textarea className="field mt-1 min-h-24" name="notes" placeholder="版本、出处、使用价值等" />
            </label>
            <label className="block">
              <span className="label">真实性、版本或使用说明</span>
              <textarea className="field mt-1 min-h-24" name="reliability_note" />
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

        <section className="space-y-4">
          <div className="panel p-5">
            <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-950">文献检索</h2>
                <p className="mt-1 text-sm text-stone-500">
                  共 {documents.length} 条，当前显示 {filteredDocuments.length} 条
                </p>
              </div>
              <button
                className="button-secondary w-full justify-center sm:w-auto"
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                <X size={16} />
                清空筛选
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="label">关键词搜索</span>
                <div className="relative mt-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input
                    className="field pl-9"
                    value={filters.keyword}
                    onChange={(event) => updateFilter("keyword", event.target.value)}
                    placeholder="搜索题名、作者、刊物、参考文献格式或说明"
                  />
                </div>
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <FilterSelect
                  label="文献类型"
                  value={filters.material_type}
                  options={filterOptions.materialTypes}
                  onChange={(value) => updateFilter("material_type", value)}
                />
                <FilterSelect
                  label="年份"
                  value={filters.year}
                  options={filterOptions.years}
                  onChange={(value) => updateFilter("year", value)}
                />
                <FilterSelect
                  label="原类型字段"
                  value={filters.source_type}
                  options={filterOptions.sourceTypes}
                  onChange={(value) => updateFilter("source_type", value)}
                />
              </div>
            </div>
          </div>

          {documents.length === 0 ? (
            <EmptyState title="尚未添加文献" description="先录入一条文献，之后可以在论文章节中绑定它。" />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState title="没有匹配的文献" description="请调整关键词或筛选条件后再试。" />
          ) : (
            filteredDocuments.map((document) => (
              <article key={document.id} className="panel p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-stone-950">{document.title}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
                      {document.author && <span>{document.author}</span>}
                      {document.year && <span>{document.year}</span>}
                      {document.material_type && (
                        <span className="tag">
                          {document.material_type}
                        </span>
                      )}
                      {!document.material_type && document.source_type && <span className="tag">{document.source_type}</span>}
                      {document.publication && <span>{document.publication}</span>}
                    </div>
                    <div className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
                      <InfoRow label="刊物 / 出版社 / 来源" value={document.publication} />
                      <InfoRow label="卷期 / 页码" value={[document.volume_issue, document.pages].filter(Boolean).join(" · ")} />
                      <InfoRow label="检索标识" value={document.identifier} />
                      <InfoRow label="原类型字段" value={document.source_type} />
                    </div>
                    {document.citation_format && (
                      <div className="surface mt-3 p-3">
                        <div className="label">规范参考文献格式</div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-800">
                          {document.citation_format}
                        </p>
                      </div>
                    )}
                    {document.notes && <p className="mt-3 text-sm leading-6 text-stone-600">{document.notes}</p>}
                    {document.reliability_note && (
                      <div className="surface mt-3 p-3">
                        <div className="label">真实性、版本或使用说明</div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                          {document.reliability_note}
                        </p>
                      </div>
                    )}
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

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="surface p-3">
      <div className="label">{label}</div>
      <div className="mt-1 text-sm text-stone-800">{value || "未填写"}</div>
    </div>
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
