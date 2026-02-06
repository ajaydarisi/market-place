"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface CaptchaRef {
  reset: () => void;
  getToken: () => string | undefined;
}

interface CaptchaProps {
  onSuccess: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export const Captcha = forwardRef<CaptchaRef, CaptchaProps>(
  ({ onSuccess, onError, onExpire }, ref) => {
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
      <div className="flex justify-center">
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
