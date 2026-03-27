"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, CheckCircle2, Eye, EyeOff, Loader2, MessageSquare, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Captcha, type CaptchaRef } from "@/components/captcha";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

export default function AuthPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<CaptchaRef>(null);

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "" },
  });

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSignIn = async (data: SignInValues) => {
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      router.push("/dashboard");
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleSignUp = async (data: SignUpValues) => {
    const hasCaptchaEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (hasCaptchaEnabled && !captchaToken) {
      toast({ title: "Please complete the CAPTCHA", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        captchaToken: captchaToken ?? undefined,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } else {
      toast({ title: "Account created!", description: "You can now sign in." });
      router.push("/dashboard");
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast({ title: "Enter your email", description: "Please enter your email above.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "A password reset link has been sent." });
      setShowForgot(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="page-shell hero-aurora min-h-screen bg-background px-4 py-6 lg:flex lg:items-center lg:py-0">
      <div className="container mx-auto grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.95fr_0.8fr] lg:gap-10">
        <div className="order-2 min-w-0 space-y-6 lg:order-1 lg:space-y-8">
          <Badge variant="outline" className="surface-glass w-fit px-4 py-2 text-xs text-muted-foreground sm:text-sm">
            <Shield className="mr-2 h-4 w-4 text-primary" />
            High-trust marketplace access
          </Badge>

          <div className="max-w-xl min-w-0 space-y-4 lg:space-y-5">
            <h1 className="text-[2.6rem] font-display font-bold leading-[1.02] text-foreground sm:text-5xl md:text-6xl">
              Welcome back to
              <span className="mt-2 block text-gradient">DevMarket</span>
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Meet the right developers faster, keep conversations flowing, and manage hiring with the same premium experience across every step.
            </p>
          </div>

          <div className="phone-scroll-row w-full max-w-full sm:grid sm:grid-cols-3 sm:gap-4">
            <Card className="surface-glass w-full border-primary/10 sm:w-auto sm:max-w-none">
              <div className="flex min-h-[11.5rem] h-full flex-col items-center justify-center px-5 py-5 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h2 className="mb-1 text-base font-bold">Curated projects</h2>
                <p className="mx-auto max-w-[14rem] text-sm text-muted-foreground">Focused flows for clients and developers.</p>
              </div>
            </Card>
            <Card className="surface-glass w-full border-accent/10 sm:w-auto sm:max-w-none">
              <div className="flex min-h-[11.5rem] h-full flex-col items-center justify-center px-5 py-5 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/[0.12] text-accent">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h2 className="mb-1 text-base font-bold">Instant context</h2>
                <p className="mx-auto max-w-[14rem] text-sm text-muted-foreground">Messaging and dashboards stay in sync.</p>
              </div>
            </Card>
            <Card className="surface-glass w-full border-primary/10 sm:w-auto sm:max-w-none">
              <div className="flex min-h-[11.5rem] h-full flex-col items-center justify-center px-5 py-5 text-center">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h2 className="mb-1 text-base font-bold">Clear delivery</h2>
                <p className="mx-auto max-w-[14rem] text-sm text-muted-foreground">Track projects from proposal to handoff.</p>
              </div>
            </Card>
          </div>
        </div>

        <Card className="surface-glass order-1 min-w-0 w-full max-w-full justify-self-stretch border-primary/10 shadow-2xl sm:max-w-md sm:justify-self-center lg:order-2">
          <CardHeader className="space-y-2 px-4 pb-6 pt-6 text-center sm:px-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-lg shadow-primary/20">
              <Briefcase className="h-6 w-6 translate-y-px" />
            </div>
            <CardTitle className="text-[2rem] leading-none sm:text-3xl">
              Dev<span className="text-primary">Market</span>
            </CardTitle>
            <CardDescription className="px-2 text-sm leading-relaxed sm:px-0 sm:text-base">
              Sign in to your account or create a new one.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-5 sm:px-6 md:pb-6">
            <Tabs defaultValue="signin" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" aria-label="Sign in tab" data-testid="signin-tab">Sign In</TabsTrigger>
              <TabsTrigger value="signup" aria-label="Sign up tab" data-testid="signup-tab">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              {showForgot ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleForgotPassword();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="forgot-email" className="text-sm font-medium leading-none text-foreground">
                      Email
                    </label>
                    <Input
                      id="forgot-email"
                      aria-label="Email for password reset"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="h-12"
                      data-testid="forgot-email-input"
                    />
                  </div>
                  <Button type="submit" aria-label="Send password reset link" className="h-12 w-full" disabled={isLoading} data-testid="forgot-send-reset-button">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                  <Button type="button" variant="ghost" aria-label="Back to sign in" className="w-full" onClick={() => setShowForgot(false)} data-testid="forgot-back-button">
                    Back to sign in
                  </Button>
                </form>
              ) : (
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                    <FormField
                      control={signInForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input aria-label="Email address" type="email" placeholder="you@example.com" className="h-12" data-testid="signin-email-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signInForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input aria-label="Password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="h-12 pr-10" data-testid="signin-password-input" {...field} />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Toggle password visibility"
                                className="absolute right-0 top-0 h-12 w-12"
                                onClick={() => setShowPassword(!showPassword)}
                                data-testid="signin-password-toggle-button"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" aria-label="Sign in" className="w-full h-12 text-lg font-semibold" disabled={isLoading} data-testid="signin-submit-button">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                    <Button type="button" variant="ghost" aria-label="Forgot password" className="w-full text-sm text-muted-foreground" onClick={() => setShowForgot(true)} data-testid="signin-forgot-password-link">
                      Forgot your password?
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>

            <TabsContent value="signup">
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={signUpForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input aria-label="First name" placeholder="John" className="h-12" data-testid="signup-firstname-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signUpForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input aria-label="Last name" placeholder="Doe" className="h-12" data-testid="signup-lastname-input" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input aria-label="Email address" type="email" placeholder="you@example.com" className="h-12" data-testid="signup-email-input" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input aria-label="Password" type={showPassword ? "text" : "password"} placeholder="Create a password" className="h-12 pr-10" data-testid="signup-password-input" {...field} />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label="Toggle password visibility"
                              className="absolute right-0 top-0 h-12 w-12"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="signup-password-toggle-button"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Captcha
                    ref={captchaRef}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                    onError={() => setCaptchaToken(null)}
                    data-testid="signup-captcha"
                    />
                  <Button type="submit" aria-label="Create account" className="w-full h-12 text-lg font-semibold" disabled={isLoading} data-testid="signup-submit-button">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
