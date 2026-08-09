export type ChargeType = "late_fee" | "damage" | "lost" | "ebook_grace_expiry";
export type ChargeStatus = "unpaid" | "paid";

export interface Charge {
  id: string;
  userId: string;
  loanId?: string;
  ebookLoanId?: string;
  type: ChargeType;
  amount: number;
  status: ChargeStatus;
  bookTitle?: string;
  createdAt: string;
  clearedAt?: string;
}

export type PaymentMethod = "paystack" | "cash";

export interface Payment {
  id: string;
  chargeId: string;
  userId: string;
  method: PaymentMethod;
  amount: number;
  paystackReference?: string;
  clearedByLibrarianId?: string;
  paidAt: string;
}
