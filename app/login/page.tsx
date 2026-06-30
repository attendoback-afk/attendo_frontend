"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { useAuth } from "@/components/providers/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAccessibleHomeRoute } from "@/lib/auth";

const loginSchema = yup
  .object({
    email: yup.string().trim().email("Enter a valid email address").required("Email is required"),
    password: yup.string().required("Password is required"),
    remember: yup.boolean().required(),
  })
  .required();

type LoginFormValues = yup.InferType<typeof loginSchema>;

const defaultValues: LoginFormValues = {
  email: "",
  password: "",
  remember: true,
};

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loading } = useAuth();
  const methods = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const handleSubmit = methods.handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      const currentUser = await login(
        {
          email: values.email.trim().toLowerCase(),
          password: values.password,
        },
        { remember: values.remember },
      );

      const next = searchParams.get("next");
      router.replace(
        next && next.startsWith("/")
          ? next
          : getAccessibleHomeRoute(currentUser),
      );
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    }
  });

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-64px)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section className="hidden lg:block">
          <div className="max-w-[560px]">
            <span className="font-['Iowan_Old_Style','Palatino_Linotype',Georgia,serif] text-[64px] font-semibold leading-none tracking-[-0.07em] text-[#21243c]">
              Attendo
            </span>
            <h1 className="mt-8 text-[40px] font-semibold leading-[1.1] tracking-[-0.04em] text-foreground">
              Welcome back to your attendance dashboard.
            </h1>
            <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-muted-foreground">
              Sign in to manage modules, sessions, attendance, and the rest of your workspace from one calm place.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {["Role-aware access", "Current user sync", "Refresh-safe"].map((item) => (
                <div key={item} className="dashboard-panel px-4 py-3 text-center text-[13px] font-medium text-[#6f6a7e]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <Card className="dashboard-panel mx-auto w-full max-w-[460px] gap-0 overflow-hidden py-0">
          <CardContent className="p-6 md:p-8">
            <div className="text-center lg:text-left">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#f6f2ff] lg:mx-0">
                <LockKeyhole className="h-5 w-5 text-[#958dc9]" />
              </div>
              <p className="mt-5 font-['Iowan_Old_Style','Palatino_Linotype',Georgia,serif] text-[42px] font-semibold leading-none tracking-[-0.07em] text-[#21243c] lg:hidden">
                Attendo
              </p>
              <h2 className="mt-5 text-[26px] font-semibold leading-[1.2] tracking-[-0.03em] text-foreground">
                Sign in
              </h2>
              <p className="mt-2 text-[14px] leading-5 text-muted-foreground">
                Use your Attendo account to continue.
              </p>
            </div>

            <Form {...methods}>
              <form onSubmit={handleSubmit} className="mt-7 grid gap-5" noValidate>
                {submitError ? (
                  <Alert variant="destructive" className="rounded-lg" aria-live="polite">
                    <AlertTitle>Login failed</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="login-email" className="dashboard-field-label">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9f98af]" />
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder="manager@example.com"
                      className="pl-11"
                      disabled={methods.formState.isSubmitting || loading}
                      aria-invalid={Boolean(methods.formState.errors.email)}
                      aria-describedby={methods.formState.errors.email ? "login-email-error" : undefined}
                      {...methods.register("email")}
                    />
                  </div>
                  {methods.formState.errors.email?.message ? (
                    <p id="login-email-error" className="text-sm text-destructive">
                      {methods.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="login-password" className="dashboard-field-label">
                    Password
                  </Label>
                  <div className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9f98af]" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="pl-11 pr-11"
                      disabled={methods.formState.isSubmitting || loading}
                      aria-invalid={Boolean(methods.formState.errors.password)}
                      aria-describedby={methods.formState.errors.password ? "login-password-error" : undefined}
                      {...methods.register("password")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg text-muted-foreground"
                      onClick={() => setShowPassword((current) => !current)}
                      disabled={methods.formState.isSubmitting || loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {methods.formState.errors.password?.message ? (
                    <p id="login-password-error" className="text-sm text-destructive">
                      {methods.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <Controller
                  control={methods.control}
                  name="remember"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="login-remember"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        disabled={methods.formState.isSubmitting || loading}
                      />
                      <Label htmlFor="login-remember" className="text-[14px] font-medium text-[#6f6a7e]">
                        Remember me
                      </Label>
                    </div>
                  )}
                />

                <Button type="submit" className="h-11 rounded-xl" disabled={methods.formState.isSubmitting || loading}>
                  {methods.formState.isSubmitting || loading ? "Signing in..." : "Login"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
