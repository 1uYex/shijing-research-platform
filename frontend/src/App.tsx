import { useEffect, useMemo, useState } from "react";
import { Layout, type PageKey } from "./components/Layout";
import {
  createChapter,
  createDocument,
  createVariant,
  deleteChapter,
  deleteDocument,
  deleteVariant,
  getChapters,
  getDocuments,
  getStats,
  getVariants,
} from "./lib/api";
import { ChaptersPage } from "./pages/ChaptersPage";
import { Dashboard } from "./pages/Dashboard";
import { DocumentsPage } from "./pages/DocumentsPage";
import { OverviewPage } from "./pages/OverviewPage";
import { VariantsPage } from "./pages/VariantsPage";
import type { ChapterItem, DocumentItem, Stats, VariantItem } from "./types/domain";

function App() {
  const [activePage, setActivePage] = useState<PageKey>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [variants, setVariants] = useState<VariantItem[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshAll() {
    setError(null);
    const [nextStats, nextDocuments, nextVariants, nextChapters] = await Promise.all([
      getStats(),
      getDocuments(),
      getVariants(),
      getChapters(),
    ]);
    setStats(nextStats);
    setDocuments(nextDocuments);
    setVariants(nextVariants);
    setChapters(nextChapters);
  }

  useEffect(() => {
    refreshAll()
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, []);

  const content = useMemo(() => {
    if (activePage === "dashboard") {
      return <Dashboard stats={stats} />;
    }
    if (activePage === "documents") {
      return (
        <DocumentsPage
          documents={documents}
          onCreate={async (formData) => {
            await createDocument(formData);
            await refreshAll();
          }}
          onDelete={async (id) => {
            await deleteDocument(id);
            await refreshAll();
          }}
        />
      );
    }
    if (activePage === "variants") {
      return (
        <VariantsPage
          variants={variants}
          onCreate={async (payload) => {
            await createVariant(payload);
            await refreshAll();
          }}
          onDelete={async (id) => {
            await deleteVariant(id);
            await refreshAll();
          }}
        />
      );
    }
    if (activePage === "chapters") {
      return (
        <ChaptersPage
          chapters={chapters}
          documents={documents}
          variants={variants}
          onCreate={async (payload) => {
            await createChapter(payload);
            await refreshAll();
          }}
          onDelete={async (id) => {
            await deleteChapter(id);
            await refreshAll();
          }}
        />
      );
    }
    return <OverviewPage chapters={chapters} />;
  }, [activePage, chapters, documents, stats, variants]);

  return (
    <Layout activePage={activePage} onNavigate={setActivePage}>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          后端连接失败：{error}
        </div>
      )}
      {loading ? (
        <div className="rounded-md border border-stone-200 bg-white p-8 text-sm text-stone-600 shadow-sm">加载中</div>
      ) : (
        content
      )}
    </Layout>
  );
}

export default App;
