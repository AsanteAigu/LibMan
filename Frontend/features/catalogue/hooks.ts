import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listBooks, getBook, createTitle, addCopy, withdrawCopy, uploadTitleCover, type BookQuery } from "@/services/books";
import type { WithdrawnReason } from "@/types/book";

export function useBooks(query: BookQuery = {}) {
  return useQuery({
    queryKey: ["books", query],
    queryFn: () => listBooks(query),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ["books", id],
    queryFn: () => getBook(id),
    enabled: !!id,
  });
}

export function useCreateTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Title added to the catalogue.");
    },
    onError: () => toast.error("Couldn't add this title."),
  });
}

export function useAddCopy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, shelfLocation }: { titleId: string; shelfLocation: string }) =>
      addCopy(titleId, shelfLocation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Copy added.");
    },
    onError: () => toast.error("Couldn't add this copy."),
  });
}

export function useWithdrawCopy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ copyId, reason }: { copyId: string; reason: WithdrawnReason }) =>
      withdrawCopy(copyId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      toast.success("Copy withdrawn.");
    },
    onError: () => toast.error("Couldn't withdraw this copy."),
  });
}

export function useUploadTitleCover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ titleId, file }: { titleId: string; file: File }) => uploadTitleCover(titleId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["ebooks"] });
      toast.success("Cover image updated.");
    },
    onError: () => toast.error("Couldn't upload this image. Only JPG, PNG, and WEBP are supported."),
  });
}
