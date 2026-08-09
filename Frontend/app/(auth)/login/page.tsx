"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { TextField } from "@/components/forms/text-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { ROUTES, homeRouteForRole } from "@/constants/routes";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setFormError(null);
    try {
      const authUser = await login(data.email, data.password);
      toast.success(`Welcome back, ${authUser.name} (${authUser.role}).`);
      // Navigating from a state update (rather than immediately in this handler)
      // guarantees the auth context has actually committed the new user before
      // the destination route's role guard reads it.
      setRedirectTo(homeRouteForRole(authUser.role));
    } catch {
      setFormError("Email or password is incorrect.");
    }
  };

  useEffect(() => {
    if (redirectTo) router.push(redirectTo);
  }, [redirectTo, router]);

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-2">
          LibMan
        </h1>
        <p className="text-on-surface-variant">Access your library account</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          icon="mail"
          type="email"
          placeholder="you@student.libman.edu"
          error={errors.email?.message}
          {...register("email")}
        />
        <div>
          <TextField
            label="Password"
            icon="lock"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <div className="flex justify-end mt-1">
            <Link href={ROUTES.forgotPassword} className="font-label-sm text-label-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        {formError && (
          <p role="alert" className="text-label-sm font-label-sm text-error -mt-2">
            {formError}
          </p>
        )}
        <SubmitButton isLoading={isSubmitting}>Sign In</SubmitButton>
      </form>
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
              New to the library?
            </span>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href={ROUTES.register}
            className="w-full flex justify-center py-2 px-4 border border-outline-variant rounded-lg shadow-sm font-label-md text-label-md text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
          >
            Register for an Account
          </Link>
        </div>
      </div>
    </>
  );
}
