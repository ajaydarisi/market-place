"use client";

import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id ?? "");
  const router = useRouter();

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    if (!profile) {
      router.push("/onboarding");
      return;
    }

    if (profile.role === "client") {
      router.push("/client/projects");
    } else {
      router.push("/developer/browse");
    }
  }, [user, profile, authLoading, profileLoading, router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
