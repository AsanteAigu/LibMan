// Real endpoints: GET/POST /api/titles, GET /api/titles/:id,
// POST /api/titles/:id/copies, PATCH /api/copies/:id/withdraw
import { apiClient } from "./api-client";
import type { Book, Copy, WithdrawnReason } from "@/types/book";

interface BackendCopy {
  id: number;
  titleId: number;
  shelfLocation: string | null;
  arrangementDetails: string | null;
  status: Copy["status"];
  withdrawnReason: WithdrawnReason | null;
  createdAt: string;
}

interface BackendTitle {
  id: number;
  name: string;
  author: string;
  replacementCost: number;
  hasEbook: boolean;
  availableCopies: number;
  copies: BackendCopy[];
  createdAt: string;
  coverImageUrl: string | null;
}

function toCopy(copy: BackendCopy): Copy {
  return {
    id: String(copy.id),
    titleId: String(copy.titleId),
    shelfLocation: copy.shelfLocation ?? undefined,
    arrangementDetails: copy.arrangementDetails ?? undefined,
    status: copy.status,
    withdrawnReason: copy.withdrawnReason ?? undefined,
    createdAt: copy.createdAt,
  };
}

function toBook(title: BackendTitle): Book {
  return {
    id: String(title.id),
    title: title.name,
    author: title.author,
    replacementCost: title.replacementCost,
    hasEbook: title.hasEbook,
    availableCopies: title.availableCopies,
    copies: title.copies.map(toCopy),
    createdAt: title.createdAt,
    coverImageUrl: title.coverImageUrl ?? undefined,
  };
}

export interface BookQuery {
  q?: string;
  availableOnly?: boolean;
}

export async function listBooks(query: BookQuery = {}): Promise<Book[]> {
  const { data } = await apiClient.get<BackendTitle[]>("/titles", {
    params: query.q ? { q: query.q } : undefined,
  });
  let books = data.map(toBook);
  if (query.availableOnly) {
    books = books.filter((b) => b.availableCopies > 0);
  }
  return books;
}

export async function getBook(id: string): Promise<Book | undefined> {
  const { data } = await apiClient.get<BackendTitle>(`/titles/${id}`);
  return toBook(data);
}

export async function createTitle(input: {
  name: string;
  author: string;
  replacementCost: number;
  hasEbook: boolean;
}): Promise<Book> {
  const { data } = await apiClient.post<BackendTitle>("/titles", input);
  return toBook(data);
}

export async function addCopy(titleId: string, shelfLocation: string): Promise<Copy> {
  const { data } = await apiClient.post<BackendCopy>(`/titles/${titleId}/copies`, { shelfLocation });
  return toCopy(data);
}

export async function withdrawCopy(copyId: string, reason: WithdrawnReason): Promise<Copy> {
  const { data } = await apiClient.patch<BackendCopy>(`/copies/${copyId}/withdraw`, { reason });
  return toCopy(data);
}

export async function uploadTitleCover(titleId: string, file: File): Promise<Book> {
  const formData = new FormData();
  formData.append("file", file);
  // No explicit Content-Type -- let the browser attach the multipart boundary itself.
  const { data } = await apiClient.post<BackendTitle>(`/titles/${titleId}/cover`, formData);
  return toBook(data);
}
