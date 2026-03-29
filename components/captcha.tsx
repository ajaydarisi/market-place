"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface CaptchaRef {
  reset: () => void;
  getToken: () => string | undefined;
}

interface CaptchaProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  className?: string;
  "data-testid"?: string;
}

export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(
  ({ onSuccess, onError, onExpire, className, "data-testid": dataTestId }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const tokenRef = useRef<string | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      reset: () => {
        tokenRef.current = undefined;
        turnstileRef.current?.reset();
      },
      getToken: () => tokenRef.current,
    }));

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      console.warn("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set. CAPTCHA disabled.");
      return null;
    }

    return (
      <div data-testid={dataTestId ?? "captcha"} className={cn("flex justify-center", className)}>
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={(token) => {
            tokenRef.current = token;
            onSuccess(token);
          }}
          onError={() => {
            tokenRef.current = undefined;
            onError?.();
          }}
          onExpire={() => {
            tokenRef.current = undefined;
            onExpire?.();
          }}
          options={{
            theme: "auto",
            size: "normal",
          }}
        />
      </div>
    );
  }
);

Captcha.displayName = "Captcha";
