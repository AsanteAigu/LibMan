"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { TextField } from "@/components/forms/text-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { AuthHeader } from "@/components/auth/auth-header";
import { ROUTES, homeRouteForRole } from "@/constants/routes";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setFormError(null);
    try {
      const authUser = await registerUser(data);
      toast.success("Account created — welcome to LibMan!");
      setRedirectTo(homeRouteForRole(authUser.role));
    } catch {
      setFormError("Couldn't create your account. Please try again.");
    }
  };

  useEffect(() => {
    if (redirectTo) router.push(redirectTo);
  }, [redirectTo, router]);

  return (
    <>
      <AuthHeader title="Create your account" subtitle="Register for library access in a minute" />
      <p className="text-label-sm font-label-sm text-on-surface-variant text-center mb-5 -mt-3">
        Your library ID is generated automatically once you sign up.
      </p>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Full name"
          icon="person"
          placeholder="Ama Boateng"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextField
          label="Email"
          icon="mail"
          type="email"
          placeholder="you@student.libman.edu"
          error={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Password"
          icon="lock"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />
        <TextField
          label="Confirm password"
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
        <SubmitButton isLoading={isSubmitting}>Create account</SubmitButton>
      </form>
      <p className="mt-6 text-center text-body-md text-on-surface-variant">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="text-primary hover:underline font-label-md">
          Sign in
        </Link>
      </p>
    </>
  );
}
