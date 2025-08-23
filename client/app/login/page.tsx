"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardStore } from "@/store/dashboardStore";
import { cn } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/aurora-background";
import {
  IconBrandGithub,
  IconBrandGoogle,
} from "@tabler/icons-react";
import { apiUrl } from "@/lib/api";

type LoginInfo = {
  email: string;
  password: string;
};

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, setUser } = useDashboardStore();

  const [loading, setLoading] = useState(false);
  const [loginInfo, setLoginInfo] = useState<LoginInfo>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginInfo((s) => ({ ...s, [name]: value }));
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`;
      const res = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginInfo),
      });

      const result = await res.json();
      const { success, message, jwtToken, email, name } = result;

      if (success) {
        toast({
          title: "Login Successful",
          description:"Welcome back!",
          variant: "default",
          duration: 2000,
        });

        localStorage.setItem(
          "user",
          JSON.stringify({ name, email, token: jwtToken })
        );
        setUser(
          localStorage.getItem("user")
            ? JSON.parse(localStorage.getItem("user") as string)
            : null
        );

        router.push("/");
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "default",
          className: "bg-red-400 text-black",
          duration: 2000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message ?? "Something went wrong",
        variant: "default",
        className: "bg-red-400 text-black",
        duration: 2000,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // hydrate store from localStorage on mount
  useEffect(() => {
    setUser(
      localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") as string)
        : null
    );
  }, [setUser]);

  // redirect if already logged in
  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  return (
    <AuroraBackground className="text-gray-900 dark:text-white">
    <main className="flex min-h-screen items-center justify-center px-4 w-full">
      {/* Glassy card that matches the other style */}
      <div
        className={cn(
          "shadow-input mx-auto w-full max-w-md rounded-none p-4 md:rounded-2xl md:p-8",
          // glass / aurora-friendly
          "bg-white/70 dark:bg-black/60 border border-black/10 dark:border-white/10",
          "supports-[backdrop-filter]:backdrop-blur-md"
        )}
      >
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Welcome back
        </h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Sign in to continue to your dashboard.
        </p>

    
        <form className="my-8 space-y-4" onSubmit={submitForm} noValidate>
          <LabelInputContainer>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              required
              onChange={handleChange}
              value={loginInfo.email}
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              onChange={handleChange}
              value={loginInfo.password}
            />
          </LabelInputContainer>

          {/* <div className="flex items-center justify-between pt-1">
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
            >
              Forgot password?
            </Link>
          </div> */}

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={cn(
              "group/btn relative block h-10 w-full rounded-md font-medium text-white",
              "bg-gradient-to-br from-black to-neutral-600",
              "shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]",
              "dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900",
              "dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]",
              loading && "opacity-70 cursor-not-allowed"
            )}
          >
            {loading ? "Signing in…" : "Sign In"}
            <BottomGradient />
          </button>

          {/* Divider */}
          <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

          {/* Social logins (optional placeholders) */}
          {/* <div className="flex flex-col gap-3">
            <button
              type="button"
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:text-white dark:shadow-[0px_0px_1px_1px_#262626]"
            >
              <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Continue with GitHub
              </span>
              <BottomGradient />
            </button>
            <button
              type="button"
              className="group/btn shadow-input relative flex h-10 w-full items-center justify-start space-x-2 rounded-md bg-gray-50 px-4 font-medium text-black dark:bg-zinc-900 dark:text-white dark:shadow-[0px_0px_1px_1px_#262626]"
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-sm text-neutral-700 dark:text-neutral-300">
                Continue with Google
              </span>
              <BottomGradient />
            </button>
          </div> */}

          <p className="pt-6 text-center text-sm text-neutral-700 dark:text-neutral-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </main>
    </AuroraBackground>
  );
}

/* ----------------- helpers (styled like the other component) ----------------- */

function BottomGradient() {
  return (
    <>
      <span className="pointer-events-none absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="pointer-events-none absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
}

function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
}
