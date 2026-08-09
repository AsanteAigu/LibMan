"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validation/auth";
import { resetPassword } from "@/services/auth";
import { TextField } from "@/components/forms/text-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { AuthHeader } from "@/components/auth/auth-header";
import { ROUTES } from "@/constants/routes";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data: ResetPasswordInput) => {
    setFormError(null);
    try {
      await resetPassword("mock-token", data.password);
      toast.success("Password updated. Please sign in.");
      router.push(ROUTES.login);
    } catch {
      setFormError("This reset link is invalid or has expired.");
    }
  };

  return (
    <>
      <AuthHeader title="Set a new password" subtitle="Choose a strong password for your account" />
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="New password"
          icon="lock"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <TextField
          label="Confirm new password"
          icon="lock"
          type="password"
          placeholder="Re-enter your password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        {formError && (
          <p role="alert" className="text-label-sm font-label-sm text-error">
            {formError}
          </p>
        )}
        <SubmitButton isLoading={isSubmitting}>Update password</SubmitButton>
      </form>
    </>
  );
}
