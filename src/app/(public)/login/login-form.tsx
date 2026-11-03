"use client";

import { useActionState, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { signIn } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, Input } from "@/components/ui/field";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [state, action, pending] = useActionState(async (prev: Awaited<ReturnType<typeof signIn>> | null, formData: FormData) => {
    setEmail(String(formData.get("email") ?? ""));
    return signIn(prev, formData);
  }, null);

  return (
    <form action={action} className="space-y-5 rounded-xl border border-line bg-paper-deep p-6 sm:p-8">
      {state && !state.ok && <FormMessage type="error">{state.error}</FormMessage>}
      <input type="hidden" name="next" value={next} />
      <Field label="Имэйл" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={email} required />
      </Field>
      <Field label="Нууц үг" htmlFor="password" required>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" />}
        Нэвтрэх
      </Button>
    </form>
  );
}
