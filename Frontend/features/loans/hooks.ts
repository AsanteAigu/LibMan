import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as loansApi from "@/services/loans";
import * as requestsApi from "@/services/borrow-requests";
import * as reservationsApi from "@/services/reservations";
import * as ebooksApi from "@/services/ebooks";
import type { BorrowRequestStatus, ReturnCondition } from "@/types/loan";

export function useLoans(filter?: { mine?: boolean }) {
  return useQuery({
    queryKey: ["loans", filter],
    queryFn: () => loansApi.listLoans(filter),
  });
}

export function useBorrowRequests(filter?: { status?: BorrowRequestStatus; mine?: boolean }) {
  return useQuery({
    queryKey: ["borrow-requests", filter],
    queryFn: () => requestsApi.listBorrowRequests(filter),
  });
}

export function useReservations(filter?: { mine?: boolean }) {
  return useQuery({
    queryKey: ["reservations", filter],
    queryFn: () => reservationsApi.listReservations(filter),
  });
}

export function useEbookLoans(enabled = true) {
  return useQuery({
    queryKey: ["ebook-loans"],
    queryFn: () => ebooksApi.listEbookLoans(),
    enabled,
  });
}

export function useEbooks() {
  return useQuery({ queryKey: ["ebooks"], queryFn: ebooksApi.listEbooks });
}

export function useUploadEbookFile() {
  const invalidate = useInvalidate(["ebooks"]);
  return useMutation({
    mutationFn: ({ ebookEditionId, file }: { ebookEditionId: string; file: File }) =>
      ebooksApi.uploadEbookFile(ebookEditionId, file),
    onSuccess: () => {
      invalidate();
      toast.success("File uploaded.");
    },
    onError: () => toast.error("Couldn't upload this file. Only PDF and EPUB are supported."),
  });
}

function useInvalidate(keys: string[]) {
  const queryClient = useQueryClient();
  return () => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
}

export function useCreateBorrowRequest() {
  const invalidate = useInvalidate(["borrow-requests"]);
  return useMutation({
    mutationFn: ({ titleId, durationMinutes }: { titleId: string; durationMinutes: number }) =>
      requestsApi.createBorrowRequest(titleId, durationMinutes),
    onSuccess: () => {
      invalidate();
      toast.success("Request sent to the librarian.");
    },
    onError: () => toast.error("Couldn't send your request. Please try again."),
  });
}

export function useApproveBorrowRequest() {
  const invalidate = useInvalidate(["borrow-requests", "loans"]);
  return useMutation({
    mutationFn: requestsApi.approveBorrowRequest,
    onSuccess: () => {
      invalidate();
      toast.success("Request approved.");
    },
    onError: () => toast.error("Couldn't approve this request."),
  });
}

export function useRejectBorrowRequest() {
  const invalidate = useInvalidate(["borrow-requests"]);
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      requestsApi.rejectBorrowRequest(id, reason),
    onSuccess: () => {
      invalidate();
      toast.success("Request rejected.");
    },
    onError: () => toast.error("Couldn't reject this request."),
  });
}

export function useCollectLoan() {
  const invalidate = useInvalidate(["loans"]);
  return useMutation({
    mutationFn: loansApi.collectLoan,
    onSuccess: () => {
      invalidate();
      toast.success("Copy marked as collected.");
    },
    onError: () => toast.error("Couldn't collect this loan."),
  });
}

export function useReturnLoan() {
  const invalidate = useInvalidate(["loans"]);
  return useMutation({
    mutationFn: ({ id, condition }: { id: string; condition: ReturnCondition }) =>
      loansApi.returnLoan(id, condition),
    onSuccess: () => {
      invalidate();
      toast.success("Copy marked as returned.");
    },
    onError: () => toast.error("Couldn't return this loan."),
  });
}

export function useExtendLoan() {
  const invalidate = useInvalidate(["loans"]);
  return useMutation({
    mutationFn: loansApi.extendLoan,
    onSuccess: () => {
      invalidate();
      toast.success("Loan extended by 7 days.");
    },
    onError: () => toast.error("Couldn't extend this loan."),
  });
}

export function useCreateReservation() {
  const invalidate = useInvalidate(["reservations"]);
  return useMutation({
    mutationFn: ({ titleId }: { titleId: string }) => reservationsApi.createReservation(titleId),
    onSuccess: () => {
      invalidate();
      toast.success("You're on the waitlist for this title.");
    },
    onError: () => toast.error("Couldn't reserve this title."),
  });
}

export function useCancelReservation() {
  const invalidate = useInvalidate(["reservations"]);
  return useMutation({
    mutationFn: reservationsApi.cancelReservation,
    onSuccess: () => {
      invalidate();
      toast.success("Reservation cancelled.");
    },
    onError: () => toast.error("Couldn't cancel this reservation."),
  });
}

export function useBorrowEbook() {
  const invalidate = useInvalidate(["ebook-loans"]);
  return useMutation({
    mutationFn: ({ ebookEditionId, durationMinutes }: { ebookEditionId: string; durationMinutes: number }) =>
      ebooksApi.borrowEbook(ebookEditionId, durationMinutes),
    onSuccess: () => {
      invalidate();
      toast.success("Ebook added to your library.");
    },
    onError: () => toast.error("Couldn't borrow this ebook."),
  });
}
