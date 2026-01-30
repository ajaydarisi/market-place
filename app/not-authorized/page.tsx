"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotAuthorized() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id ?? "");
  const router = useRouter();

  const handleGoHome = () => {
    if (profile?.role === "developer") {
      router.push("/developer/browse");
    } else {
      router.push("/client/projects");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container max-w-lg mx-auto px-4 py-24">
        <Card className="text-center">
          <CardContent className="pt-10 pb-10 space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <ShieldX className="h-12 w-12 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Not Authorized</h1>
              <p className="text-muted-foreground">
                You don&apos;t have permission to access this page. This area is restricted to a different role.
              </p>
            </div>

            <Button onClick={handleGoHome} aria-label="Go to dashboard" size="lg">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
