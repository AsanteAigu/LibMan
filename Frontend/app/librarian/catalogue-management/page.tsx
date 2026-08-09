"use client";

import { useRef, useState } from "react";
import { useBooks, useAddCopy, useWithdrawCopy, useUploadTitleCover } from "@/features/catalogue/hooks";
import { useEbooks, useUploadEbookFile } from "@/features/loans/hooks";
import { CreateTitleDialog } from "@/features/catalogue/create-title-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { TableSkeleton } from "@/components/shared/skeletons";
import { cn } from "@/lib/utils";
import type { Copy, WithdrawnReason } from "@/types/book";

const ACCEPTED_EXTENSIONS = [".pdf", ".epub"];
const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const WITHDRAW_REASONS: { value: WithdrawnReason; label: string }[] = [
  { value: "torn", label: "Torn" },
  { value: "dirty", label: "Dirty" },
  { value: "lost", label: "Lost" },
];

export default function CatalogueManagementPage() {
  const [tab, setTab] = useState<"copies" | "ebooks">("copies");
  const { data: books, isLoading } = useBooks();
  const { data: ebooks, isLoading: ebooksLoading } = useEbooks();
  const uploadFile = useUploadEbookFile();
  const uploadCover = useUploadTitleCover();
  const addCopy = useAddCopy();
  const withdrawCopy = useWithdrawCopy();
  const [withdrawing, setWithdrawing] = useState<{ titleId: string; copy: Copy } | null>(null);
  const [reason, setReason] = useState<WithdrawnReason>("torn");
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [shelf, setShelf] = useState("");
  const [creatingTitle, setCreatingTitle] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCoverFor, setUploadingCoverFor] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handlePickFile = (editionId: string) => {
    setUploadingFor(editionId);
    fileInputRef.current?.click();
  };

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !uploadingFor) return;
    const editionId = uploadingFor;
    setUploadingFor(null);
    uploadFile.mutate({ ebookEditionId: editionId, file });
  };

  const handlePickCover = (titleId: string) => {
    setUploadingCoverFor(titleId);
    coverInputRef.current?.click();
  };

  const handleCoverChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !uploadingCoverFor) return;
    const titleId = uploadingCoverFor;
    setUploadingCoverFor(null);
    uploadCover.mutate({ titleId, file });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-1">Catalogue Management</h1>
          <p className="text-body-md text-on-surface-variant">Manage titles, copies, and ebook licences</p>
        </div>
        <button
          onClick={() => setCreatingTitle(true)}
          className="shrink-0 rounded-lg bg-primary text-on-primary font-label-md text-label-md px-4 py-2.5 hover:bg-primary/90 transition-colors"
        >
          + Add title
        </button>
      </div>

      <div className="flex gap-1 border-b border-outline-variant">
        {(["copies", "ebooks"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-label-md font-label-md border-b-2 -mb-px transition-colors",
              tab === t ? "border-primary text-primary" : "border-transparent text-on-surface-variant"
            )}
          >
            {t === "copies" ? "Titles & Copies" : "Ebook Licences"}
          </button>
        ))}
      </div>

      {(tab === "copies" ? isLoading : isLoading || ebooksLoading) ? (
        <TableSkeleton rows={6} />
      ) : tab === "copies" ? (
        <div className="flex flex-col gap-4">
          <input
            ref={coverInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_EXTENSIONS.join(",")}
            className="hidden"
            onChange={handleCoverChosen}
          />
          {books?.map((book) => {
            const isUploadingCover = uploadCover.isPending && uploadCover.variables?.titleId === book.id;
            return (
            <div key={book.id} className="rounded-lg border border-outline-variant overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-surface-container-low gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handlePickCover(book.id)}
                    disabled={isUploadingCover}
                    className="relative shrink-0 size-12 rounded-md overflow-hidden border border-outline-variant bg-surface-container-lowest flex items-center justify-center disabled:opacity-50"
                    title={book.coverImageUrl ? "Replace cover" : "Add cover"}
                  >
                    {book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={book.coverImageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-outline text-[20px]">
                        {isUploadingCover ? "hourglass_empty" : "add_photo_alternate"}
                      </span>
                    )}
                  </button>
                  <div className="min-w-0">
                    <p className="font-headline-md text-body-md text-on-surface truncate">{book.title}</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">{book.author}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAddingFor(book.id);
                    setShelf("");
                  }}
                  className="shrink-0 text-label-sm font-label-sm text-primary hover:underline"
                >
                  + Add copy
                </button>
              </div>
              <div className="divide-y divide-outline-variant">
                {book.copies.map((copy) => (
                  <div key={copy.id} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-body-md text-on-surface-variant">
                      Shelf {copy.shelfLocation ?? "—"}
                    </span>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={copy.status} />
                      {copy.status !== "withdrawn" && (
                        <button
                          onClick={() => setWithdrawing({ titleId: book.id, copy })}
                          className="text-label-sm font-label-sm text-error hover:underline"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {addingFor === book.id && (
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low">
                  <input
                    value={shelf}
                    onChange={(e) => setShelf(e.target.value)}
                    placeholder="Shelf location e.g. A-12"
                    className="flex-1 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-body-md"
                  />
                  <button
                    onClick={() => {
                      addCopy.mutate({ titleId: book.id, shelfLocation: shelf });
                      setAddingFor(null);
                    }}
                    disabled={!shelf || addCopy.isPending}
                    className="rounded-md bg-primary text-on-primary text-label-sm font-label-sm px-3 py-1.5 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setAddingFor(null)}
                    className="text-label-sm font-label-sm text-on-surface-variant"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-outline-variant divide-y divide-outline-variant">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            className="hidden"
            onChange={handleFileChosen}
          />
          {books?.map((book) => {
            const edition = ebooks?.find((e) => e.titleId === book.id);
            const isUploadingThis = uploadFile.isPending && uploadFile.variables?.ebookEditionId === edition?.id;
            return (
              <div key={book.id} className="flex items-center justify-between px-4 py-3 gap-4">
                <div>
                  <p className="font-headline-md text-body-md text-on-surface">{book.title}</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">{book.author}</p>
                  {edition && (
                    <p className="text-label-sm font-label-sm text-on-surface-variant mt-0.5">
                      {edition.fileUrl ? (
                        <>
                          File attached ({edition.fileFormat?.toUpperCase()}) ·{" "}
                          <a
                            href={edition.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View
                          </a>
                        </>
                      ) : (
                        "No file uploaded yet"
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={book.hasEbook ? "available" : "cancelled"} label={book.hasEbook ? "Licenced" : "No licence"} />
                  {edition && (
                    <button
                      onClick={() => handlePickFile(edition.id)}
                      disabled={isUploadingThis}
                      className="text-label-sm font-label-sm text-primary hover:underline disabled:opacity-50"
                    >
                      {isUploadingThis ? "Uploading…" : edition.fileUrl ? "Replace file" : "Upload file"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationDialog
        open={!!withdrawing}
        onOpenChange={(open) => !open && setWithdrawing(null)}
        title="Withdraw this copy?"
        description="This removes the copy from circulation. Choose the reason for the record."
        confirmLabel="Withdraw copy"
        destructive
        isLoading={withdrawCopy.isPending}
        onConfirm={() => {
          if (!withdrawing) return;
          withdrawCopy.mutate(
            { copyId: withdrawing.copy.id, reason },
            { onSuccess: () => setWithdrawing(null) }
          );
        }}
      >
        <div className="flex flex-col gap-2 mt-2">
          {WITHDRAW_REASONS.map((r) => (
            <label key={r.value} className="flex items-center gap-2 text-body-md text-on-surface">
              <input
                type="radio"
                name="withdraw-reason"
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="accent-primary"
              />
              {r.label}
            </label>
          ))}
        </div>
      </ConfirmationDialog>

      <CreateTitleDialog open={creatingTitle} onOpenChange={setCreatingTitle} />
    </div>
  );
}
