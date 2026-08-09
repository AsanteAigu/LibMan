"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MIN_MINUTES = 1;
const MAX_MINUTES = 43_200; // 30 days

type Unit = "minutes" | "hours" | "days";
const UNIT_TO_MINUTES: Record<Unit, number> = { minutes: 1, hours: 60, days: 1440 };

export function DurationPickerDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  isLoading,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: (durationMinutes: number) => void;
}) {
  const [amount, setAmount] = useState(14);
  const [unit, setUnit] = useState<Unit>("days");

  const totalMinutes = Math.round(amount * UNIT_TO_MINUTES[unit]);
  const isValid = Number.isFinite(totalMinutes) && totalMinutes >= MIN_MINUTES && totalMinutes <= MAX_MINUTES;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setAmount(14);
          setUnit("days");
        }
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline-md text-headline-md">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <label className="text-label-md font-label-md text-on-surface-variant">How long do you need it?</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-24 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
              className="flex-1 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md"
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
            </select>
          </div>
          {!isValid && (
            <p className="text-label-sm font-label-sm text-error">Choose a duration between 1 minute and 30 days.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={() => isValid && onConfirm(totalMinutes)} disabled={!isValid || isLoading}>
            {isLoading ? "Submitting…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
