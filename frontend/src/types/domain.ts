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
};

export type VariantItem = {
  id: number;
  poem_title: string;
  received_text: string;
  excavated_text: string;
  variant_type: string;
  explanation?: string | null;
};

export type ChapterItem = {
  id: number;
  title: string;
  order_index: number;
  argument?: string | null;
  documents: DocumentItem[];
  variants: VariantItem[];
};
