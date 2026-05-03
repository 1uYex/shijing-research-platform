import { BookOpen, Database, FileText, GitBranch, Layers3, Network } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import type { Stats } from "../types/domain";

type DashboardProps = {
  stats: Stats | null;
  onSeedDemo: () => Promise<void>;
};

const cards = [
  { label: "文献数", key: "documents", icon: BookOpen },
  { label: "异文数", key: "variants", icon: GitBranch },
  { label: "章节数", key: "chapters", icon: Layers3 },
] as const;

export function Dashboard({ stats, onSeedDemo }: DashboardProps) {
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSeedDemo() {
    setSeeding(true);
    setMessage(null);
    try {
      await onSeedDemo();
      setMessage("示例数据已导入或已存在，可前往文献库、异文数据和关系总览查看。");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <>
      <PageHeader
        title="文献—异文—论证结构研究平台"
        description="面向《诗经》文本流变研究，把文献材料、异文证据与论文论证结构组织为可追踪、可展示、可复核的研究网络。"
      />
      <section className="paper-texture panel mb-6 p-6 sm:p-8">
        <div className="relative z-[1] grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b99b63]/35 bg-[#fff8e8]/78 px-3 py-1 text-xs font-semibold text-[#725b2e] shadow-sm">
              <FileText size={14} />
              大学生创新创业项目 MVP
            </div>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-stone-950 sm:text-4xl">
              将论文写作中隐含的“材料如何支撑论证”转化为清晰的结构化证据链。
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600">
              平台不是普通文献库，而是围绕“文献—异文—论证—论文结构”的研究过程建立数据关联，便于答辩展示项目创新点与后续扩展方向。
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["文献结构化", "异文证据链", "关系可视化"].map((tag) => (
                <span key={tag} className="tag bg-white/70">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button className="button-primary" onClick={handleSeedDemo} disabled={seeding}>
                <Database size={17} />
                {seeding ? "导入中" : "导入示例数据"}
              </button>
              <p className="text-xs leading-5 text-stone-500">
                示例内容均以“【示例数据】”标注，仅用于展示功能，不代表真实研究结论。
              </p>
            </div>
            {message && (
              <div className="mt-3 rounded-xl border border-[#d7c7aa]/80 bg-[#fffaf2]/82 px-3 py-2 text-sm text-stone-700 shadow-sm">
                {message}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-[#d7c7aa]/70 bg-white/70 p-4 shadow-[0_18px_42px_rgba(67,56,43,0.1)]">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Network size={16} />
              核心关系
            </div>
            <div className="space-y-3 text-sm text-stone-700">
              <div className="rounded-xl border border-stone-200/80 bg-[#fcfaf5] p-3 shadow-sm">章节提出论证问题</div>
              <div className="rounded-xl border border-stone-200/80 bg-[#f8fafc] p-3 shadow-sm">文献提供学术依据</div>
              <div className="rounded-xl border border-stone-200/80 bg-[#f5f7f4] p-3 shadow-sm">异文提供文本证据</div>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.key} className="panel elevate-hover p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-500">{card.label}</p>
                  <p className="mt-3 text-4xl font-bold text-stone-950">{stats?.[card.key] ?? 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d7c7aa]/70 bg-[#fff8e8]/72 text-[#314f60] shadow-sm">
                  <Icon size={22} />
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <section className="panel mt-6 p-5">
        <h2 className="text-lg font-semibold text-stone-950">研究工作流</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">从材料录入到结构化论证展示，形成适合小组协作和阶段汇报的研究路径。</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["收录文献", "录入异文", "组织章节", "查看关联"].map((step, index) => (
            <div key={step} className="surface elevate-hover p-4">
              <div className="text-xs font-semibold text-stone-500">步骤 {index + 1}</div>
              <div className="mt-2 text-sm font-bold text-stone-900">{step}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
