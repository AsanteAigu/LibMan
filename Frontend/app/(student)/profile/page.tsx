"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { profileSchema, type ProfileInput } from "@/lib/validation/profile";
import { TextField } from "@/components/forms/text-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { ROLE_LABELS } from "@/constants/roles";
import { initials } from "@/lib/format";

export default function ProfilePage() {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, email: user?.email },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Profile updated.");
  };

  if (!user) return null;

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md text-headline-md">
          {initials(user.name)}
        </div>
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">{user.name}</h1>
          <p className="text-body-md text-on-surface-variant">{ROLE_LABELS[user.role]}</p>
        </div>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField label="Full name" icon="person" error={errors.name?.message} {...register("name")} />
        <TextField label="Email" icon="mail" type="email" error={errors.email?.message} {...register("email")} />
        <SubmitButton isLoading={isSubmitting} className="w-fit px-6">
          Save changes
        </SubmitButton>
      </form>
    </div>
  );
}
