"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDashboardStore } from "@/store/dashboardStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { apiUrl } from "@/lib/api";


type RegisterInfo = {
  name: string;
  email: string;
  password: string;
  cpassword: string;
};

function Page() {
  const router = useRouter();
  const { user, setUser } = useDashboardStore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState<RegisterInfo>({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterInfo((s) => ({ ...s, [name]: value }));
  };

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem("user");
      setUser(saved ? JSON.parse(saved) : null);
    }
  }, [setUser, user]);

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user) router.push("/");
  }, [user, router]);

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (registerInfo.password !== registerInfo.cpassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "default",
        className: "bg-red-400 text-black",
        duration: 2000,
      });
      return;
    }

    try {
      setLoading(true);
      // const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`;
      const res = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerInfo),
      });
      const result = await res.json();
      const { success, message } = result;

      if (success) {
        toast({
          title: "Account Created",
          variant: "default",
          className: "bg-green-400 text-black",
          duration: 2000,
        });
        router.push("/login");
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

  if (user) return null;

  return (
    <AuroraBackground className="text-gray-900 dark:text-white">
    <main className="flex min-h-screen items-center justify-center px-4 w-full">
      {/* Glassy / aurora-friendly container */}
      <div
        className={cn(
          "shadow-input mx-auto w-full max-w-md rounded-none p-4 md:rounded-2xl md:p-8",
          "bg-white/70 dark:bg-black/60 border border-black/10 dark:border-white/10",
          "supports-[backdrop-filter]:backdrop-blur-md"
        )}
      >
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Create your account
        </h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Join TrustByte and start managing work with clarity.
        </p>

        <form className="my-8 space-y-4" onSubmit={submitForm} noValidate>
          <LabelInputContainer>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              required
              onChange={handleChange}
              value={registerInfo.name}
            />
          </LabelInputContainer>

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
              value={registerInfo.email}
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              onChange={handleChange}
              value={registerInfo.password}
            />
          </LabelInputContainer>

          <LabelInputContainer>
            <Label htmlFor="cpassword">Confirm Password</Label>
            <Input
              id="cpassword"
              name="cpassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              onChange={handleChange}
              value={registerInfo.cpassword}
            />
          </LabelInputContainer>

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
            {loading ? "Creating account…" : "Register"}
            <BottomGradient />
          </button>

          <p className="pt-6 text-center text-sm text-neutral-700 dark:text-neutral-300">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
    </AuroraBackground>
  );
}

export default Page;

/* ---------- helpers (same look as the new login) ---------- */

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
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
}
