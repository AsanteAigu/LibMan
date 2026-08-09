"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TextField } from "@/components/forms/text-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { useCreateTitle } from "@/features/catalogue/hooks";
import { createTitleSchema, type CreateTitleInput } from "@/lib/validation/catalogue";

export function CreateTitleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createTitle = useCreateTitle();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTitleInput>({
    resolver: zodResolver(createTitleSchema),
    defaultValues: { hasEbook: false },
  });

  const onSubmit = async (data: CreateTitleInput) => {
    await createTitle.mutateAsync(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline-md text-headline-md">Add a title</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Title" icon="menu_book" error={errors.name?.message} {...register("name")} />
          <TextField label="Author" icon="person" error={errors.author?.message} {...register("author")} />
          <TextField
            label="Replacement cost (GHS)"
            icon="payments"
            type="number"
            step="0.01"
            min="0"
            error={errors.replacementCost?.message}
            {...register("replacementCost", { valueAsNumber: true })}
          />
          <label className="flex items-center gap-2 text-body-md text-on-surface">
            <input type="checkbox" className="accent-primary" {...register("hasEbook")} />
            Has an ebook edition
          </label>
          <DialogFooter className="-mx-0 -mb-0 border-0 bg-transparent p-0">
            <SubmitButton isLoading={isSubmitting || createTitle.isPending}>Add title</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
