"use client";
import React, { useMemo, useState, useEffect } from "react";
import { Sidebar, SidebarBody } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import Tasklist from "./Tasklist";
import Kanban from "./Kanban";
import { useDashboardStore } from "@/store/dashboardStore";
import { Button } from "@/components/ui/button";
import { List, Kanban as KanbanIcon, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useToast } from "@/hooks/use-toast";
import { useTaskStore } from "@/store/taskStore";
import Avatar, { genConfig } from "react-nice-avatar";

/* ============================= */
/* Sidebar + Dashboard container */
/* ============================= */

export default function SidebarComponent() {
  const [open, setOpen] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  const { boardView, setBoardView, user, setUser } = useDashboardStore();
  const { setTasks } = useTaskStore();
  const { toast } = useToast();

  // Ensure we have user from localStorage on first mount (in case store resets on refresh)
  useEffect(() => {
    if (!user) {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    }
  }, [user, setUser]);

  // Stable avatar config using a seed based on user email (avoids hydration flicker)
  const avatarConfig = useMemo(
    () =>
      genConfig({
        seed: user?.email || "guest",
        shape: "circle", // keeps it consistent with your design
        // you can also set fixed traits if you want:
        // sex: "man" | "woman",
      }),
    [user?.email]
  );

  const displayName = user?.name || "Guest";

  const handleThemeToggle = () => setTheme(isDark ? "light" : "dark");

  const handleLogout = () => {
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      variant: "destructive",
      duration: 2000,
    });
    setUser(null);
    setTasks([]);
  };

  return (
    <div
      className={cn(
        "flex w-full min-h-screen min-w-0 flex-1 flex-col md:flex-row",
        "border border-neutral-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-y-auto">
            <BrandRow open={open} />

            <div className="mt-8 flex flex-col gap-2">
              <Row
                open={open}
                label="Dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  setBoardView("list");
                }}
                icon={
                  <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                }
              />

              <Row
                open={open}
                label={isDark ? "Light Mode" : "Dark Mode"}
                onClick={(e) => {
                  e.preventDefault();
                  handleThemeToggle();
                }}
                icon={
                  isDark ? (
                    <Sun className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  ) : (
                    <Moon className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  )
                }
              />

              <Row
                open={open}
                label="Logout"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                icon={
                  <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                }
              />
            </div>
          </div>

          {/* === User row with Nice Avatar === */}
          <div>
            <Row
              open={open}
              label={displayName}
              href="#"
              icon={
                <span className="inline-grid rounded-full ring-1 ring-white/20 overflow-hidden">
                  <Avatar
                    {...avatarConfig}
                    // react-nice-avatar sizes are set via style (className won't size it)
                    style={{ width: 28, height: 28 }}
                    title={displayName}
                  />
                </span>
              }
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <Dashboard />
    </div>
  );
}

/* ============= */
/* Row component */
/* ============= */

function Row({
  open,
  label,
  href,
  icon,
  onClick,
}: {
  open: boolean;
  label: string;
  href?: string;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}) {
  return (
    <a
      href={href ?? "#"}
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition",
        "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100",
        "hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60"
      )}
    >
      <span className="grid place-items-center">{icon}</span>
      <span
        className={cn(
          "whitespace-pre font-medium text-neutral-900 dark:text-white",
          "transition-[max-width,opacity] duration-200",
          open ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0 overflow-hidden"
        )}
      >
        {label}
      </span>
    </a>
  );
}

/* ========= */
/* Branding  */
/* ========= */

function BrandRow({ open }: { open: boolean }) {
  return (
    <a
      href="#"
      className={cn(
        "group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition",
        "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100",
        "hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60"
      )}
      aria-label="TrustByte"
    >
      <span className="grid place-items-center">
        <img
          src="/images/nextjslogo.svg"
          alt="TrustByte logo"
          width={20}
          height={20}
          className="h-5 w-5"
        />
      </span>
      <span
        className={cn(
          "whitespace-pre font-semibold text-neutral-900 dark:text-white",
          "transition-[max-width,opacity] duration-200",
          open ? "opacity-100 max-w-[180px]" : "opacity-0 max-w-0 overflow-hidden"
        )}
      >
        TrustByte
      </span>
    </a>
  );
}

/* ======================== */
/* The main content column  */
/* ======================== */

const Dashboard = () => {
  const { boardView, setBoardView } = useDashboardStore();

  return (
    <div className="flex flex-1 min-h-0 min-w-0">
      <div
        className="
          flex h-full w-full flex-1 flex-col min-h-0 min-w-0
          rounded-tl-2xl border border-neutral-200 bg-white p-4 md:p-6
          dark:border-neutral-700 dark:bg-neutral-900
        "
      >
        <Header />

        <div className="mb-4 flex gap-2">
          <Button
            variant={boardView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setBoardView("list")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            List View
          </Button>
          <Button
            variant={boardView === "kanban" ? "default" : "outline"}
            size="sm"
            onClick={() => setBoardView("kanban")}
            className="flex items-center gap-2"
          >
            <KanbanIcon className="h-4 w-4" />
            Kanban View
          </Button>
        </div>

        <div
          className="flex-1 overflow-y-auto min-h-0 min-w-0"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {boardView === "list" ? <Tasklist /> : <Kanban />}
        </div>
      </div>
    </div>
  );
};
