"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Password recovery landing page (F6). The recovery link signs the user in via
// PKCE, so on arrival there is a session and we can call updateUser. Without
// this page the old redirect dropped users straight into the app still not
// knowing their password.
export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", description: "Re-enter the same password.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "Couldn't update password", description: error.message, variant: "destructive" });
      setIsLoading(false);
      return;
    }
    toast({ title: "Password updated", description: "You're all set." });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="page-shell hero-aurora min-h-screen bg-background px-4 py-6 md:flex md:items-center md:justify-center">
      <Card className="mx-auto w-full max-w-md border-primary/10 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-bold">Set a new password</CardTitle>
          <CardDescription>
            {hasSession === false
              ? "This reset link is invalid or has expired. Request a new one from the sign-in page."
              : "Choose a new password for your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasSession === false ? (
            <Button variant="outline" className="w-full" aria-label="Back to sign in" onClick={() => router.push("/auth")}>
              Back to sign in
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  aria-label="New password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={hasSession === null}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  aria-label="Confirm password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={hasSession === null}
                />
              </div>
              <Button type="submit" className="w-full" aria-label="Update password" disabled={isLoading || hasSession === null}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
