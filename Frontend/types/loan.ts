export type BorrowRequestStatus = "pending" | "approved" | "rejected";

export interface BorrowRequest {
  id: string;
  userId: string;
  userName: string;
  copyId?: string;
  bookTitle: string;
  status: BorrowRequestStatus;
  rejectionReason?: string;
  requestedAt: string;
  decidedAt?: string;
  requestedDurationMinutes?: number;
}

export type LoanState = "on_hold" | "on_loan" | "returned";
export type ReturnCondition = "ok" | "damaged" | "lost";

export interface Loan {
  id: string;
  borrowRequestId?: string;
  copyId: string;
  userId: string;
  userName: string;
  bookTitle: string;
  shelfLocation?: string;
  holdStartedAt: string;
  holdExpiresAt?: string;
  collectedAt?: string;
  dueDate?: string;
  returnedAt?: string;
  returnCondition?: ReturnCondition;
  extended: boolean;
  extendedDueDate?: string;
  loanState: LoanState;
  requestedDurationMinutes?: number;
}

export type ReservationStatus =
  | "waiting"
  | "notified"
  | "expired"
  | "cancelled"
  | "fulfilled";

export interface Reservation {
  id: string;
  titleId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  queuePosition: number;
  status: ReservationStatus;
  notifiedAt?: string;
  windowExpiresAt?: string;
  createdAt: string;
}

export type EbookLoanStatus = "active" | "grace" | "returned" | "removed";
export type EbookFileFormat = "pdf" | "epub";

export interface Ebook {
  id: string;
  titleId: string;
  bookTitle: string;
  author: string;
  fileUrl?: string;
  fileFormat?: EbookFileFormat;
  coverImageUrl?: string;
}

export interface EbookLoan {
  id: string;
  ebookEditionId: string;
  bookTitle: string;
  userId: string;
  borrowedAt: string;
  loanExpiresAt: string;
  graceExpiresAt?: string;
  returnedAt?: string;
  extended: boolean;
  extendedExpiresAt?: string;
  status: EbookLoanStatus;
}
