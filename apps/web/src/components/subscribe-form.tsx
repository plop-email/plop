"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { subscribeAction } from "@/actions/subscribe-action";
import { Button } from "@plop/ui/button";
import { cn } from "@plop/ui/cn";
import { Icons } from "@plop/ui/icons";
import { Input } from "@plop/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="ml-auto bg-[#B8FF2C] text-[#0B0D0F] hover:bg-[#B8FF2C]/90 font-semibold"
      disabled={pending}
    >
      {pending ? <Icons.Loader className="size-4 animate-spin" /> : "Subscribe"}
    </Button>
  );
}

type SubscribeFormProps = {
  group: string;
  placeholder: string;
  className?: string;
};

export function SubscribeForm({
  group,
  placeholder,
  className,
}: SubscribeFormProps) {
  const [isSubmitted, setSubmitted] = useState(false);

  return (
    <div aria-live="polite">
      {isSubmitted ? (
        <div className="flex h-10 items-center justify-between border border-white/12 bg-[#0B0D0F] px-3 text-sm text-white">
          <span>Subscribed</span>
          <Icons.Check className="h-4 w-4 text-[#B8FF2C]" />
        </div>
      ) : (
        <form
          className="flex flex-col gap-4"
          action={async (formData) => {
            setSubmitted(true);
            await subscribeAction(formData, group);

            setTimeout(() => {
              setSubmitted(false);
            }, 5000);
          }}
        >
          <Input
            placeholder={placeholder}
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            aria-label="Email address"
            required
            className={cn(
              "border-white/12 bg-[#0B0D0F] text-white placeholder:text-white/60",
              className,
            )}
          />

          <SubmitButton />
        </form>
      )}
    </div>
  );
}
