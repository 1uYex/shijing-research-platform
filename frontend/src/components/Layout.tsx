import { BookOpen, FileText, GitBranch, Home, Layers3, Network } from "lucide-react";
import type { ReactNode } from "react";

export type PageKey = "dashboard" | "documents" | "variants" | "chapters" | "overview";

type LayoutProps = {
  activePage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
};

const navItems = [
  { key: "dashboard", label: "首页", icon: Home },
  { key: "documents", label: "文献库", icon: BookOpen },
  { key: "variants", label: "异文数据", icon: GitBranch },
  { key: "chapters", label: "论文结构", icon: Layers3 },
  { key: "overview", label: "关系总览", icon: Network },
] as const;

export function Layout({ activePage, onNavigate, children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-stone-200/70 bg-[#fbf7ef]/88 px-5 py-5 shadow-[16px_0_48px_rgba(67,56,43,0.08)] backdrop-blur-xl lg:block">
        <div className="paper-texture rounded-2xl border border-stone-200/70 bg-white/68 p-4 shadow-sm">
          <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#b99b63]/40 bg-gradient-to-br from-[#111827] via-[#233246] to-[#314f60] text-white shadow-lg shadow-slate-900/10">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-sm font-bold leading-5 text-stone-950">诗经文本流变研究支持平台</div>
            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a6f3c]">
              Digital Humanities
            </div>
          </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-[#d7c7aa]/70 bg-[#fffaf2]/70 p-4 text-xs leading-5 text-stone-600 shadow-sm">
          面向大学生创新创业项目答辩，展示文本流变研究中的材料、证据与论文结构关系。
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition duration-200 ${
                  active
                    ? "bg-gradient-to-r from-[#111827] to-[#314f60] text-white shadow-lg shadow-slate-900/12"
                    : "text-stone-600 hover:bg-white/76 hover:text-stone-950 hover:shadow-sm"
                }`}
              >
                <Icon className="transition group-hover:scale-105" size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-stone-200/70 bg-[#fbf7ef]/92 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#111827] to-[#314f60] text-white">
              <FileText size={17} />
            </span>
            诗经文本流变研究支持平台
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active ? "bg-[#1f2937] text-white shadow-md" : "border border-stone-200/80 bg-white/78 text-stone-700"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>
        <main className="page-shell mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
