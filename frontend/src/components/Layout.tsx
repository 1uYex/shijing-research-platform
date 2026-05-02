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
    <div className="min-h-screen bg-[#f7f7f5]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-stone-200 bg-white px-5 py-5 lg:block">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-stone-200 bg-stone-950 text-white">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-sm font-bold leading-5 text-stone-950">文献—异文—论证结构</div>
            <div className="text-xs text-stone-500">《诗经》研究支持平台</div>
          </div>
        </div>
        <div className="mt-6 rounded-md border border-stone-200 bg-stone-50 p-3 text-xs leading-5 text-stone-600">
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
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-stone-900">
            <FileText size={18} />
            文献—异文—论证结构
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  className={`flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold ${
                    active ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-700"
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
