import { BookOpen, FileText, GitBranch, Layers3, Network } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import type { Stats } from "../types/domain";

type DashboardProps = {
  stats: Stats | null;
};

const cards = [
  { label: "文献数", key: "documents", icon: BookOpen },
  { label: "异文数", key: "variants", icon: GitBranch },
  { label: "章节数", key: "chapters", icon: Layers3 },
] as const;

export function Dashboard({ stats }: DashboardProps) {
  return (
    <>
      <PageHeader
        title="文献—异文—论证结构研究平台"
        description="面向《诗经》文本流变研究，把文献材料、异文证据与论文论证结构组织为可追踪、可展示、可复核的研究网络。"
      />
      <section className="panel mb-5 p-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">
              <FileText size={14} />
              大学生创新创业项目 MVP
            </div>
            <h2 className="mt-4 max-w-3xl text-2xl font-semibold leading-9 text-stone-950">
              将论文写作中隐含的“材料如何支撑论证”转化为清晰的结构化证据链。
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-600">
              平台不是普通文献库，而是围绕“文献—异文—论证—论文结构”的研究过程建立数据关联，便于答辩展示项目创新点与后续扩展方向。
            </p>
          </div>
          <div className="surface p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Network size={16} />
              核心关系
            </div>
            <div className="space-y-2 text-sm text-stone-700">
              <div className="rounded-md bg-white p-3">章节提出论证问题</div>
              <div className="rounded-md bg-white p-3">文献提供学术依据</div>
              <div className="rounded-md bg-white p-3">异文提供文本证据</div>
            </div>
          </div>
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <section key={card.key} className="panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-500">{card.label}</p>
                  <p className="mt-3 text-4xl font-bold text-stone-950">{stats?.[card.key] ?? 0}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-stone-700">
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
            <div key={step} className="surface p-4">
              <div className="text-xs font-semibold text-stone-500">步骤 {index + 1}</div>
              <div className="mt-2 text-sm font-bold text-stone-900">{step}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
