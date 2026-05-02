import type { ChapterItem, DocumentItem, Stats, VariantItem } from "../types/domain";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL. Please set it in frontend/.env or Vercel Environment Variables.");
}

export const API_BASE_URL = apiBaseUrl.replace(/\/$/, "");

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export function getStats() {
  return request<Stats>("/stats");
}

export function getDocuments() {
  return request<DocumentItem[]>("/documents");
}

export function createDocument(formData: FormData) {
  return request<DocumentItem>("/documents", {
    method: "POST",
    body: formData,
  });
}

export function deleteDocument(id: number) {
  return request<{ ok: boolean }>(`/documents/${id}`, { method: "DELETE" });
}

export function getVariants() {
  return request<VariantItem[]>("/variants");
}

export function createVariant(payload: Omit<VariantItem, "id">) {
  return request<VariantItem>("/variants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteVariant(id: number) {
  return request<{ ok: boolean }>(`/variants/${id}`, { method: "DELETE" });
}

export type ChapterPayload = {
  title: string;
  order_index: number;
  argument?: string;
  document_ids: number[];
  variant_ids: number[];
};

export function getChapters() {
  return request<ChapterItem[]>("/chapters");
}

export function createChapter(payload: ChapterPayload) {
  return request<ChapterItem>("/chapters", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteChapter(id: number) {
  return request<{ ok: boolean }>(`/chapters/${id}`, { method: "DELETE" });
}

export function getOverview() {
  return request<ChapterItem[]>("/overview");
}
