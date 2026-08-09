"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validation/auth";
import { forgotPassword } from "@/services/auth";
import { TextField } from "@/components/forms/text-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { AuthHeader } from "@/components/auth/auth-header";
import { ROUTES } from "@/constants/routes";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    await forgotPassword(data.email);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        <span className="material-symbols-outlined text-tertiary-fixed-dim text-[40px] mb-3">
          mark_email_read
        </span>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Check your email</h1>
        <p className="text-body-md text-on-surface-variant mb-6">
          If an account matches that address, we&apos;ve sent a link to reset your password.
        </p>
        <Link href={ROUTES.login} className="text-primary hover:underline font-label-md text-label-md">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <AuthHeader title="Forgot your password?" subtitle="We'll email you a reset link" />
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          icon="mail"
          type="email"
          placeholder="you@student.libman.edu"
          error={errors.email?.message}
          {...register("email")}
        />
        <SubmitButton isLoading={isSubmitting}>Send reset link</SubmitButton>
      </form>
      <p className="mt-6 text-center text-body-md text-on-surface-variant">
        <Link href={ROUTES.login} className="text-primary hover:underline font-label-md">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
