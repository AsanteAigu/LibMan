// Real endpoints: GET /api/ebook-editions, GET/POST /api/ebook-loans,
// POST /api/ebook-editions/:id/file (librarian upload)
import { apiClient } from "./api-client";
import type { Ebook, EbookFileFormat, EbookLoan, EbookLoanStatus } from "@/types/loan";

interface BackendEbookEdition {
  id: number;
  titleId: number;
  bookTitle: string;
  author: string;
  fileUrl: string | null;
  fileFormat: EbookFileFormat | null;
  coverImageUrl: string | null;
}

interface BackendEbookLoan {
  id: number;
  ebookEditionId: number;
  bookTitle: string;
  userId: number;
  borrowedAt: string | null;
  loanExpiresAt: string;
  graceExpiresAt: string | null;
  returnedAt: string | null;
  extended: boolean;
  extendedExpiresAt: string | null;
  status: EbookLoanStatus;
}

function toEbook(e: BackendEbookEdition): Ebook {
  return {
    id: String(e.id),
    titleId: String(e.titleId),
    bookTitle: e.bookTitle,
    author: e.author,
    fileUrl: e.fileUrl ?? undefined,
    fileFormat: e.fileFormat ?? undefined,
    coverImageUrl: e.coverImageUrl ?? undefined,
  };
}

function toEbookLoan(l: BackendEbookLoan): EbookLoan {
  return {
    id: String(l.id),
    ebookEditionId: String(l.ebookEditionId),
    bookTitle: l.bookTitle,
    userId: String(l.userId),
    borrowedAt: l.borrowedAt ?? "",
    loanExpiresAt: l.loanExpiresAt,
    graceExpiresAt: l.graceExpiresAt ?? undefined,
    returnedAt: l.returnedAt ?? undefined,
    extended: l.extended,
    extendedExpiresAt: l.extendedExpiresAt ?? undefined,
    status: l.status,
  };
}

export async function listEbooks(): Promise<Ebook[]> {
  const { data } = await apiClient.get<BackendEbookEdition[]>("/ebook-editions");
  return data.map(toEbook);
}

// Always the authenticated user's own loans -- the backend has no librarian "view all" mode.
export async function listEbookLoans(): Promise<EbookLoan[]> {
  const { data } = await apiClient.get<BackendEbookLoan[]>("/ebook-loans");
  return data.map(toEbookLoan);
}

export async function borrowEbook(ebookEditionId: string, durationMinutes: number): Promise<EbookLoan> {
  const { data } = await apiClient.post<BackendEbookLoan>("/ebook-loans", null, {
    params: { ebookEditionId: Number(ebookEditionId), durationMinutes },
  });
  return toEbookLoan(data);
}

export async function uploadEbookFile(ebookEditionId: string, file: File): Promise<Ebook> {
  const formData = new FormData();
  formData.append("file", file);
  // No explicit Content-Type here -- the browser must set multipart/form-data
  // itself so it can append the required boundary param; setting it manually
  // (even to the "right" value) strips the boundary and breaks parsing server-side.
  const { data } = await apiClient.post<BackendEbookEdition>(
    `/ebook-editions/${ebookEditionId}/file`,
    formData
  );
  return toEbook(data);
}
