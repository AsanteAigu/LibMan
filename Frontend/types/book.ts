export type CopyStatus = "available" | "on_hold" | "on_loan" | "withdrawn";
export type WithdrawnReason = "torn" | "dirty" | "lost";

export interface Copy {
  id: string;
  titleId: string;
  shelfLocation?: string;
  arrangementDetails?: string;
  status: CopyStatus;
  withdrawnReason?: WithdrawnReason;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  replacementCost: number;
  hasEbook: boolean;
  copies: Copy[];
  availableCopies: number;
  createdAt: string;
  coverImageUrl?: string;
}
