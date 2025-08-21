"use client";

import { format } from "date-fns";
import React, { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import EditDeleteMenu from "./EditDeleteMenu";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/store/taskStore";
import { TaskPriority, TaskStatus } from "@/types/types";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowUpDown, Filter, X, AlertCircle } from "lucide-react";

const Tasklist = () => {
  const { toast } = useToast();
  const { tasks, updateTask } = useTaskStore();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );
  const [sortBy, setSortBy] = useState<
    "title" | "priority" | "dueDate" | "none"
  >("none");

  const processedTasks = useMemo(() => {
    const filteredTasks = tasks.filter(
      (task) =>
        (statusFilter === "all" || task.status === statusFilter) &&
        (priorityFilter === "all" || task.priority === priorityFilter)
    );
    if (sortBy === "none") return filteredTasks;

    return [...filteredTasks].sort((a, b) => {
      if (sortBy === "title") {
        return sortOrder === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      if (sortBy === "priority") {
        const priorityOrder = { Low: 0, Medium: 1, High: 2 };
        return sortOrder === "asc"
          ? priorityOrder[a.priority] - priorityOrder[b.priority]
          : priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return sortOrder === "asc" ? 1 : -1;
        if (!b.dueDate) return sortOrder === "asc" ? -1 : 1;
        return sortOrder === "asc"
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      }
      return 0;
    });
  }, [tasks, statusFilter, priorityFilter, sortBy, sortOrder]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/80 hover:bg-red-500 text-white border-red-300/30 backdrop-blur-sm";
      case "Medium":
        return "bg-yellow-500/80 hover:bg-yellow-500 text-white border-yellow-300/30 backdrop-blur-sm";
      case "Low":
        return "bg-green-500/80 hover:bg-green-500 text-white border-green-300/30 backdrop-blur-sm";
      default:
        return "bg-slate-500/80 hover:bg-slate-500 text-white border-slate-300/30 backdrop-blur-sm";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-400/30";
      case "In Progress":
        return "bg-blue-500/20 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-400/30";
      case "To Do":
        return "bg-indigo-500/20 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-400/30";
      default:
        return "bg-slate-500/20 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-400/30";
    }
  };

  const isOverdue = (dueDate: Date | null | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleStatusUpdate = async (task: any, newStatus: TaskStatus) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/updatetask`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      updateTask({ ...task, status: newStatus });
      toast({
        title: "Task Updated",
        description: `Status changed to ${newStatus}`,
        className:
          "bg-white/20 dark:bg-black/20 backdrop-blur-md border-white/20 text-slate-900 dark:text-white",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setPriorityFilter("all");
    setSortBy("none");
  };

  const hasActiveFilters =
    statusFilter !== "all" || priorityFilter !== "all" || sortBy !== "none";

  return (
    <div className="relative min-h-screen">
      {/* Aurora Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-violet-500/20 animate-pulse" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Task Management
          </h1>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300">
            Organize and track your tasks with advanced filtering and sorting
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 md:mb-8 rounded-2xl border border-white/20 bg-white/20 p-4 backdrop-blur-md dark:bg-black/20 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            {/* Filter Section */}
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                <Filter className="h-4 w-4 text-indigo-400" />
                <span className="text-sm md:text-base">Filters</span>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Select
                  value={statusFilter}
                  onValueChange={(v) =>
                    setStatusFilter(v as TaskStatus | "all")
                  }
                >
                  <SelectTrigger className="w-full bg-white/20 text-sm dark:bg-black/20 backdrop-blur-sm border-white/20 text-slate-900 dark:text-white hover:bg-white/25 dark:hover:bg-black/25 transition-colors sm:w-[140px] lg:w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 bg-white/95 backdrop-blur-md dark:bg-black/95">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={(v) =>
                    setPriorityFilter(v as TaskPriority | "all")
                  }
                >
                  <SelectTrigger className="w-full bg-white/20 text-sm dark:bg-black/20 backdrop-blur-sm border-white/20 text-slate-900 dark:text-white hover:bg-white/25 dark:hover:bg-black/25 transition-colors sm:w-[140px] lg:w-[160px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 bg-white/95 backdrop-blur-md dark:bg-black/95">
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort Section */}
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <span className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">
                Sort
              </span>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Select
                  value={sortBy}
                  onValueChange={(v) =>
                    setSortBy(v as "title" | "priority" | "dueDate" | "none")
                  }
                >
                  <SelectTrigger className="w-full bg-white/20 text-sm dark:bg-black/20 backdrop-blur-sm border-white/20 text-slate-900 dark:text-white hover:bg-white/25 dark:hover:bg-black/25 transition-colors sm:w-[140px] lg:w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="border-white/20 bg-white/95 backdrop-blur-md dark:bg-black/95">
                    <SelectItem value="none">No Sorting</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                  </SelectContent>
                </Select>

                {sortBy !== "none" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                    }
                    className="bg-white/20 text-xs md:text-sm dark:bg-black/20 backdrop-blur-sm border-white/20 text-slate-900 dark:text-white hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-200"
                  >
                    <ArrowUpDown className="mr-2 h-3 w-3" />
                    {sortOrder === "asc" ? "A-Z" : "Z-A"}
                  </Button>
                )}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="self-start text-xs md:text-sm text-slate-900 transition-all duration-200 hover:bg-white/20 dark:text-white dark:hover:bg-black/20 lg:self-center"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex flex-col items-start gap-2 text-xs text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between md:text-sm">
          <span>
            Showing{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {processedTasks.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {tasks.length}
            </span>{" "}
            tasks
          </span>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
              <span className="font-medium text-blue-400">Filters active</span>
            </div>
          )}
        </div>

        {/* Table / Cards */}
        <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/20 backdrop-blur-md dark:bg-black/20">
          {processedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
              <div className="mb-6 text-4xl opacity-60 md:text-5xl">📋</div>
              <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white md:text-xl">
                No tasks found
              </h3>
              <p className="max-w-md text-xs text-slate-600 dark:text-slate-300 md:text-sm">
                {hasActiveFilters
                  ? "Try adjusting your filters to see more tasks"
                  : "Create your first task to get started on your journey"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20 bg-white/10 transition-colors hover:bg-white/20 dark:bg-black/10 dark:hover:bg-black/20">
                      <TableHead className="py-4 text-sm font-semibold text-slate-900 dark:text-white md:text-base">
                        Task Details
                      </TableHead>
                      <TableHead className="py-4 text-sm font-semibold text-slate-900 dark:text-white md:text-base">
                        Due Date
                      </TableHead>
                      <TableHead className="py-4 text-sm font-semibold text-slate-900 dark:text-white md:text-base">
                        Priority
                      </TableHead>
                      <TableHead className="py-4 text-sm font-semibold text-slate-900 dark:text-white md:text-base">
                        Status
                      </TableHead>
                      <TableHead className="py-4 text-right text-sm font-semibold text-slate-900 dark:text-white md:text-base">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedTasks.map((task, index) => (
                      <TableRow
                        key={task._id}
                        className="border-white/10 transition-all duration-200 hover:bg-white/10 dark:hover:bg-black/10 animate-in fade-in slide-in-from-left-4"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <TableCell className="max-w-md py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold capitalize text-slate-900 dark:text-white md:text-base">
                                {task.title}
                              </h3>
                              {isOverdue(task.dueDate) &&
                                task.status !== "Completed" && (
                                  <AlertCircle className="h-4 w-4 animate-pulse text-red-400" />
                                )}
                            </div>
                            {task.description && (
                              <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300 md:text-sm">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="min-w-fit">
                          {task.dueDate ? (
                            <div
                              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs backdrop-blur-sm md:text-sm
                              ${
                                isOverdue(task.dueDate) &&
                                task.status !== "Completed"
                                  ? "border-red-400/30 bg-red-500/20 text-red-300"
                                  : "border-white/10 bg-white/10 text-slate-700 dark:bg-black/10 dark:text-slate-300"
                              }`}
                            >
                              <Calendar className="h-4 w-4 text-indigo-400" />
                              <span className="font-medium">
                                {format(new Date(task.dueDate), "MMM d, yyyy")}
                                {isOverdue(task.dueDate) &&
                                  task.status !== "Completed" && (
                                    <span className="ml-2 animate-pulse text-red-400">
                                      Overdue
                                    </span>
                                  )}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 md:text-sm">
                              No due date
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={`${getPriorityColor(
                              task.priority
                            )} border px-2.5 py-1 text-xs font-medium md:text-sm`}
                          >
                            {task.priority}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Select
                            value={task.status}
                            onValueChange={(value) =>
                              handleStatusUpdate(task, value as TaskStatus)
                            }
                          >
                            <SelectTrigger
                              className={`w-full ${getStatusColor(
                                task.status
                              )} border backdrop-blur-sm py-2 text-xs font-medium md:text-sm`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-white/20 bg-white/95 backdrop-blur-md dark:bg-black/95">
                              <SelectItem value="To Do">To Do</SelectItem>
                              <SelectItem value="In Progress">
                                In Progress
                              </SelectItem>
                              <SelectItem value="Completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell className="text-right">
                          <EditDeleteMenu task={task} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="border-white/20 bg-white/10 dark:bg-black/10">
                      <TableCell
                        colSpan={5}
                        className="py-4 text-center text-sm font-semibold text-slate-900 dark:text-white md:text-base"
                      >
                        Total: {processedTasks.length} task
                        {processedTasks.length !== 1 ? "s" : ""}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>

              {/* Mobile / Tablet Cards */}
              <div className="space-y-4 p-4 lg:hidden">
                {processedTasks.map((task, index) => (
                  <div
                    key={task._id}
                    className="animate-in fade-in slide-in-from-left-4 rounded-xl border border-white/20 bg-white/20 p-4 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:bg-white/25 dark:bg-black/20 dark:hover:bg-black/25"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-3">
                      {/* Title + Desc */}
                      <div>
                        <div className="mb-1.5 flex items-center gap-2">
                          <h3 className="text-sm font-semibold capitalize text-slate-900 dark:text-white md:text-base">
                            {task.title}
                          </h3>
                          {isOverdue(task.dueDate) &&
                            task.status !== "Completed" && (
                              <AlertCircle className="h-4 w-4 animate-pulse text-red-400" />
                            )}
                        </div>
                        {task.description && (
                          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 md:text-sm">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3">
                        <Badge
                          className={`${getPriorityColor(
                            task.priority
                          )} border text-xs font-medium md:text-sm`}
                        >
                          {task.priority}
                        </Badge>

                        {task.dueDate && (
                          <div
                            className={`flex items-center gap-2 rounded-lg border px-3 py-1 text-xs md:text-sm
                  text-black dark:text-white
        ${
          isOverdue(task.dueDate) && task.status !== "Completed"
            ? "border-red-400/30 bg-red-500/10 dark:bg-red-500/20"
            : "border-black/10 bg-black/[0.04] dark:border-white/10 dark:bg-white/5"
        }`}
                          >
                            <Calendar className="h-3 w-3" />
                            <time
                              dateTime={new Date(task.dueDate).toISOString()}
                            >
                              {format(new Date(task.dueDate), "MMM d")}
                            </time>
                            {isOverdue(task.dueDate) &&
                              task.status !== "Completed" && (
                                <span className="ml-1 text-red-600 dark:text-red-300">
                                  Overdue
                                </span>
                              )}
                          </div>
                        )}
                      </div>

                      {/* Status + Actions */}
                      <div className="flex items-center justify-between gap-3">
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            handleStatusUpdate(task, value as TaskStatus)
                          }
                        >
                          <SelectTrigger
                            className={`flex-1 ${getStatusColor(
                              task.status
                            )} border backdrop-blur-sm text-xs font-medium md:text-sm`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-white/20 bg-white/95 backdrop-blur-md dark:bg-black/95">
                            <SelectItem value="To Do">To Do</SelectItem>
                            <SelectItem value="In Progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        <EditDeleteMenu task={task} />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="py-4 text-center">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white md:text-base">
                    Total: {processedTasks.length} task
                    {processedTasks.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasklist;