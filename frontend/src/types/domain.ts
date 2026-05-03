export type Stats = {
  documents: number;
  variants: number;
  chapters: number;
};

export type DocumentItem = {
  id: number;
  title: string;
  author?: string | null;
  year?: string | null;
  source_type?: string | null;
  notes?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  publication?: string | null;
  volume_issue?: string | null;
  pages?: string | null;
  identifier?: string | null;
  citation_format?: string | null;
  material_type?: string | null;
  reliability_note?: string | null;
};

export type VariantItem = {
  id: number;
  poem_title: string;
  received_text: string;
  excavated_text: string;
  variant_type: string;
  explanation?: string | null;
  source_material?: string | null;
  slip_or_page?: string | null;
  received_version?: string | null;
  region?: string | null;
  period?: string | null;
  evidence_note?: string | null;
  confidence_level?: "高" | "中" | "低" | null;
};

export type ChapterItem = {
  id: number;
  title: string;
  order_index: number;
  argument?: string | null;
  documents: DocumentItem[];
  variants: VariantItem[];
};
