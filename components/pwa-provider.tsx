"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "devmarket-pwa-dismissed";

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasEngaged, setHasEngaged] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker registration failed", error);
      });
    });
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    const engage = () => setHasEngaged(true);

    window.addEventListener("scroll", engage, { once: true, passive: true });
    window.addEventListener("pointerdown", engage, { once: true });
    window.addEventListener("keydown", engage, { once: true });

    return () => {
      window.removeEventListener("scroll", engage);
      window.removeEventListener("pointerdown", engage);
      window.removeEventListener("keydown", engage);
    };
  }, []);

  useEffect(() => {
    if (!deferredPrompt || !hasEngaged || isStandalone) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const timer = window.setTimeout(() => {
      setShowPrompt(true);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [deferredPrompt, hasEngaged, isStandalone]);

  const promptCopy = useMemo(
    () => ({
      title: "Install DevMarket",
      subtitle: "Keep projects, messages, and hiring flows one tap away.",
    }),
    []
  );

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "dismissed") {
      localStorage.setItem(DISMISS_KEY, "1");
    }

    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShowPrompt(false);
  };

  return (
    <>
      {children}
      {showPrompt && deferredPrompt && !isStandalone && (
        <div className="safe-x pointer-events-none fixed inset-x-0 bottom-[calc(var(--mobile-nav-height)+var(--safe-area-bottom)+0.75rem)] z-[70] px-4 md:bottom-6 md:px-6">
          <div className="pointer-events-auto mx-auto flex max-w-md items-end">
            <div className="glass-card mobile-panel w-full border-primary/15 shadow-2xl shadow-primary/15">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-lg shadow-primary/20">
                    <Download className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold">
                      {promptCopy.title}
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{promptCopy.subtitle}</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" aria-label="Dismiss install prompt" onClick={handleDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" className="w-full" onClick={() => void handleInstall()}>
                  <Download className="mr-2 h-4 w-4" />
                  Install App
                </Button>
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleDismiss}>
                  Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
