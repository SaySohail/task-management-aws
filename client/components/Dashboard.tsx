"use client";

import SidebarComponent from "./Sidebar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTaskStore } from "@/store/taskStore";
import { useDashboardStore } from "@/store/dashboardStore";
import Header from "./Header";
import { apiUrl } from "@/lib/api";

export function DashboardComponent() {
  const { user, setUser } = useDashboardStore();
  const { setTasks } = useTaskStore();
  const router = useRouter();

  useEffect(() => {
    setUser(
      localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user") as string)
        : null
    );
  }, [setUser]);

  useEffect(() => {
    if (!user) router.push("/homepage");
  }, [user, router]);

  // load tasks only when authenticated (optional)
  useEffect(() => {
    const run = async () => {
      if (!user) return;
      // const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/alltasks`;
      const res = await fetch(apiUrl("/api/alltasks"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user?.token || "",
        },
        body: JSON.stringify({ user: user?.email }),
      });
      const result = await res.json();
      setTasks(result.tasks || []);
    };
    run().catch(console.error);
  }, [user, setTasks]);

  if (!user) return null;

  return (
    // Full-screen shell: sidebar occupies the viewport
    <div className="fixed inset-0 flex w-screen h-screen bg-secondary dark:bg-background">
      <SidebarComponent />
     
    </div>
  );
}

export default DashboardComponent;
