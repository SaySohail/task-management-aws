"use client";

import React from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Task, TaskStatus } from "@/types/types";
import {
  Calendar,
  GripVertical,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EditDeleteMenu from "./EditDeleteMenu";
import { useTaskStore } from "@/store/taskStore";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

/* ---------------------- responsive helpers ---------------------- */
const useIsMobile = (breakpointPx = 1024) => {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width: ${breakpointPx - 1}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile("matches" in e ? e.matches : (e as MediaQueryList).matches);
    setIsMobile(mq.matches);
    // @ts-ignore Safari fallback
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => {
      // @ts-ignore Safari fallback
      mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
    };
  }, [breakpointPx]);
  return isMobile;
};

/* ---------------------- drag portal ---------------------- */
const DragPortal: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [root, setRoot] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    let el = document.getElementById("drag-portal") as HTMLElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = "drag-portal";
      el.style.position = "relative";
      el.style.zIndex = "9999";
      document.body.appendChild(el);
    }
    setRoot(el);
  }, []);
  if (!root) return null;
  return createPortal(children, root);
};

/* compose our visual transforms with DnD inline styles */
function withExtraTransform(
  style: React.CSSProperties | undefined,
  extra: string,
  extraZ = 9999
): React.CSSProperties {
  const base = style ?? {};
  return {
    ...base,
    transform: base.transform ? `${base.transform} ${extra}` : extra,
    zIndex: Math.max(extraZ, (base as any).zIndex ?? 0),
    willChange: "transform",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  };
}

/* ---------------------- dots state + refs ---------------------- */
type RefMap<T> = Record<string, T>;
const useDotsState = () => {
  const scrollContainersRef = React.useRef<RefMap<HTMLDivElement | null>>({});
  const cardRefsRef = React.useRef<RefMap<(HTMLElement | null)[]>>({});
  const observersRef = React.useRef<RefMap<IntersectionObserver | null>>({});
  const [activeIndexByCol, setActiveIndexByCol] = React.useState<Record<string, number>>({});

  const setActive = React.useCallback((colId: string, idx: number) => {
    setActiveIndexByCol((prev) => (prev[colId] === idx ? prev : { ...prev, [colId]: idx }));
  }, []);

  const cleanupObservers = React.useCallback((cols: string[]) => {
    cols.forEach((c) => {
      observersRef.current[c]?.disconnect?.();
      observersRef.current[c] = null;
    });
  }, []);

  const attachObservers = React.useCallback(
    (colIds: string[]) => {
      cleanupObservers(colIds);
      colIds.forEach((colId) => {
        const root = scrollContainersRef.current[colId];
        if (!root) return;

        const obs = new IntersectionObserver(
          (entries) => {
            let best: IntersectionObserverEntry | null = null;
            for (const e of entries) {
              if (!e.isIntersecting) continue;
              if (!best || e.intersectionRatio > (best?.intersectionRatio ?? 0)) best = e;
            }
            if (best?.target) {
              const idx = Number((best.target as HTMLElement).dataset.index);
              if (!Number.isNaN(idx)) setActive(colId, idx);
            }
          },
          { root, threshold: [0.5, 0.75, 1] }
        );

        observersRef.current[colId] = obs;
        const cards = cardRefsRef.current[colId] || [];
        cards.forEach((el) => el && obs.observe(el));
      });
    },
    [cleanupObservers, setActive]
  );

  const scrollToCard = (colId: string, idx: number) => {
    const el = cardRefsRef.current[colId]?.[idx];
    el?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  };

  return {
    scrollContainersRef,
    cardRefsRef,
    observersRef,
    activeIndexByCol,
    setActive,
    attachObservers,
    cleanupObservers,
    scrollToCard,
  };
};

/* ---------------------- Status Modal Component ---------------------- */
import {
  X,
  MoveRight,
  NotebookPen,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";

const StatusChangeModal: React.FC<{
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (newStatus: TaskStatus) => void;
}> = ({ task, isOpen, onClose, onStatusChange }) => {
  if (!isOpen || !task) return null;

  const statuses: {
    id: TaskStatus;
    label: string;
    chipClass: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "To Do" as TaskStatus,
      label: "To Do",
      chipClass:
        "bg-gradient-to-br from-blue-500 via-blue-500 to-indigo-600 ring-white/70 shadow-[0_12px_28px_rgba(59,130,246,0.45)]",
      icon: (
        <NotebookPen
          strokeWidth={2.8}
          className="h-4 w-4 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
        />
      ),
    },
    {
      id: "In Progress" as TaskStatus,
      label: "In Progress",
      chipClass:
        "bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 ring-white/70 shadow-[0_12px_28px_rgba(99,102,241,0.45)]",
      icon: (
        <RefreshCcw
          strokeWidth={2.8}
          className="h-4 w-4 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
        />
      ),
    },
    {
      id: "Completed" as TaskStatus,
      label: "Completed",
      chipClass:
        "bg-gradient-to-br from-emerald-500 via-emerald-500 to-green-600 ring-white/70 shadow-[0_12px_28px_rgba(16,185,129,0.45)]",
      icon: (
        <CheckCircle2
          strokeWidth={2.8}
          className="h-4 w-4 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.35)]"
        />
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="
          relative w-full sm:w-[380px] max-w-[95vw]
          rounded-t-3xl sm:rounded-2xl
          border border-white/25 dark:border-white/10
          bg-white/95 dark:bg-neutral-900/90
          backdrop-blur-xl
          shadow-[0_12px_48px_rgba(2,6,23,0.35),inset_0_1px_0_rgba(255,255,255,0.25)]
          animate-in slide-in-from-bottom-10 sm:fade-in
          isolation-auto
          max-h-[75vh] sm:max-h-[80vh]
          flex flex-col
          mb-safe-bottom sm:mb-0
        "
      >
        {/* subtle aurora tint */}
        <div className="pointer-events-none absolute -inset-px rounded-[inherit] [mask:linear-gradient(#000,transparent)] bg-gradient-to-br from-blue-500/15 via-indigo-400/15 to-violet-400/15" />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-2">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full
                       bg-white/90 dark:bg-white/10 border border-white/40
                       hover:bg-white dark:hover:bg-white/15 transition z-10"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-slate-900 dark:text-slate-200" />
          </button>

          {/* Mobile handle */}
          <div className="mx-auto mb-2 mt-0.5 h-1.5 w-10 rounded-full bg-slate-300/90 dark:bg-slate-600 sm:hidden" />

          {/* Title */}
          <div className="mb-4 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Move Task
            </h3>
            <p className="mt-1 line-clamp-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              {task.title}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {statuses.map((s) => {
              const isCurrent = s.id === task.status;
              return (
                <button
                  key={s.id}
                  disabled={isCurrent}
                  onClick={() => onStatusChange(s.id)}
                  className={`
                    group w-full rounded-xl border px-3.5 py-3 text-left transition
                    flex items-center justify-between
                    ${isCurrent
                      ? "cursor-not-allowed opacity-85 border-white/50 bg-white/70 dark:bg-white/10"
                      : "border-white/50 hover:bg-white/80 dark:hover:bg-white/15"}
                    bg-white/80 dark:bg-white/10 backdrop-blur-md
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* saturated chip */}
                    <span
                      className={`
                        grid h-9 w-9 place-items-center rounded-lg ring-1 ${s.chipClass}
                      `}
                    >
                      {s.icon}
                    </span>
                    <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                      {s.label}
                    </span>
                    {isCurrent && (
                      <span className="ml-1 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                        Current
                      </span>
                    )}
                  </div>

                  {!isCurrent && (
                    <MoveRight
                      strokeWidth={2.2}
                      className="h-4 w-4 text-slate-800 dark:text-white transition group-hover:translate-x-0.5"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t border-white/20 p-3 sm:p-4 pb-4 sm:pb-5">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-white/50 bg-white/85
                       px-4 py-2.5 text-sm font-medium text-slate-900 transition
                       hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================= */
/*       Main Kanban         */
/* ========================= */

const Kanban = () => {
  const { toast } = useToast();
  const { tasks, setTasks } = useTaskStore();
  const isMobile = useIsMobile(1024); // Tailwind lg breakpoint
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [showStatusModal, setShowStatusModal] = React.useState(false);

  const {
    scrollContainersRef,
    cardRefsRef,
    observersRef,
    activeIndexByCol,
    attachObservers,
    cleanupObservers,
    scrollToCard,
  } = useDotsState();

  const columns = [
    { id: "To Do" as TaskStatus, title: "To Do", accent: "border-indigo-300/30" },
    { id: "In Progress" as TaskStatus, title: "In Progress", accent: "border-blue-500/30" },
    { id: "Completed" as TaskStatus, title: "Completed", accent: "border-violet-200/30" },
  ];
  const columnIds = columns.map((c) => c.id);

  React.useEffect(() => {
    if (!isMobile) {
      cleanupObservers(columnIds);
      return;
    }
    const t = setTimeout(() => attachObservers(columnIds), 0);
    return () => {
      clearTimeout(t);
      cleanupObservers(columnIds);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, tasks.length, tasks.map((t) => t.status).join("|")]);

  const updateTaskStatus = async (task: Task) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/updatetask`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: task.status }),
      });
      if (!response.ok) throw new Error("Failed to update task");
      toast({
        title: "Task Moved",
        description: `Task moved to ${task.status}`,
        className:
          "bg-white/20 dark:bg-black/20 backdrop-blur-md border-white/20 text-slate-900 dark:text-white",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleMobileTaskClick = (task: Task, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-edit-menu]')) return;
    setSelectedTask(task);
    setShowStatusModal(true);
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    if (!selectedTask) return;
    const updatedTask = { ...selectedTask, status: newStatus };
    const taskIndex = tasks.findIndex((t) => t._id === selectedTask._id);
    if (taskIndex !== -1) {
      const newTasks = [...tasks.slice(0, taskIndex), updatedTask, ...tasks.slice(taskIndex + 1)];
      setTasks(newTasks);
      updateTaskStatus(updatedTask);
    }
    setShowStatusModal(false);
    setSelectedTask(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const draggedItemId = result.draggableId;
    const sourceColumn = result.source.droppableId;
    const destinationColumn = result.destination.droppableId;

    const idx = tasks.findIndex((t) => t._id === draggedItemId);
    if (idx === -1) return;

    const draggedTask = tasks[idx];

    if (sourceColumn !== destinationColumn) {
      const updatedTask = { ...draggedTask, status: destinationColumn as TaskStatus };
      const newTasks = [...tasks.slice(0, idx), updatedTask, ...tasks.slice(idx + 1)];
      setTasks(newTasks);
      updateTaskStatus(updatedTask);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/80 hover:bg-red-500 text-white border-red-300/30";
      case "Medium":
        return "bg-yellow-500/80 hover:bg-yellow-500 text-white border-yellow-300/30";
      case "Low":
        return "bg-green-500/80 hover:bg-green-500 text-white border-green-300/30";
      default:
        return "bg-slate-500/80 hover:bg-slate-500 text-white border-slate-300/30";
    }
  };

  const isOverdue = (dueDate: Date | null | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getTasksForColumn = (status: string) =>
    tasks
      .filter((t) => t.status === status)
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          const cmp = +new Date(a.dueDate) - +new Date(b.dueDate);
          if (cmp !== 0) return cmp;
        }
        if (a.dueDate && !b.dueDate) return -1;
        if (!a.dueDate && b.dueDate) return 1;
        const priorityOrder = { High: 3, Medium: 2, Low: 1 } as const;
        const pc =
          (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        if (pc !== 0) return pc;
        return a.title.localeCompare(b.title);
      });

  // Mobile Card (smaller type)
  const MobileTaskCard: React.FC<{ task: Task; index: number; columnId: string }> = ({
    task,
    index,
    columnId,
  }) => (
    <div
      ref={(el) => {
        (cardRefsRef.current[columnId] ||= [])[index] = el;
      }}
      data-index={index}
      onClick={(e) => handleMobileTaskClick(task, e)}
      className={`
        bg-white/20 dark:bg-black/20 
        backdrop-blur-md 
        border border-white/20 
        rounded-xl 
        p-3
        transition-all duration-300
        hover:bg-white/25 dark:hover:bg-black/25 hover:shadow-lg
        snap-start min-w-[80vw] sm:min-w-[60vw] md:min-w-[50vw]
        cursor-pointer active:scale-95
        relative
      `}
    >
      <div className="absolute top-2 right-2">
        <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </div>

      <div className="mb-2 sm:mb-3 flex items-start justify-between">
        <div className="flex flex-1 items-center gap-2 pr-6">
          <Badge
            className={`
              ${getPriorityColor(task.priority)} 
              text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 
              backdrop-blur-sm 
              border
            `}
          >
            {task.priority}
          </Badge>
          {isOverdue(task.dueDate) && task.status !== "Completed" && (
            <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />
          )}
        </div>
        <div data-edit-menu>
          <EditDeleteMenu task={task} />
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        <h4 className="text-sm sm:text-[15px] md:text-base font-semibold text-slate-900 dark:text-white leading-tight capitalize">
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs sm:text-[13px] md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">
            {task.description}
          </p>
        )}

        {task.dueDate && (
          <div
            className={`
              flex items-center gap-2 text-[11px] sm:text-xs md:text-[13px]
              px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg
              backdrop-blur-sm
              ${
                isOverdue(task.dueDate) && task.status !== "Completed"
                  ? "bg-red-500/20 text-red-300 border border-red-400/30"
                  : "bg-white/10 dark:bg-black/10 text-slate-600 dark:text-slate-400 border border-white/10"
              }
            `}
          >
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(task.dueDate), "MMM d, yyyy")}
              {isOverdue(task.dueDate) && task.status !== "Completed" && (
                <span className="ml-2 font-medium animate-pulse">Overdue</span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 border-t border-white/10 pt-2">
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center">
          Tap to change status
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      {/* Aurora Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-violet-500/20 md:animate-pulse" />
        <div className="absolute left-1/4 top-0 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl md:h-96 md:w-96 md:animate-pulse" />
        <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl md:h-80 md:w-80 md:animate-pulse md:delay-1000" />
        <div className="absolute left-1/2 bottom-1/4 h-60 w-60 rounded-full bg-violet-500/30 blur-3xl md:h-72 md:w-72 md:animate-pulse md:delay-2000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="mb-5 md:mb-8">
          <h1 className="mb-1.5 text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Task Board
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-700 dark:text-slate-300">
            {isMobile
              ? "Tap tasks to change status • Drag and drop on desktop"
              : "Organize your tasks with drag and drop functionality"}
          </p>
        </div>

        {isMobile ? (
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            {columns.map((column) => {
              const columnTasks = getTasksForColumn(column.id);
              cardRefsRef.current[column.id] ||= [];

              return (
                <div key={column.id} className="flex flex-col">
                  {/* Column Header */}
                  <div
                    className={`
                      sticky top-0 z-10
                      bg-white/40 dark:bg-black/40 
                      backdrop-blur-md 
                      border border-white/20 ${column.accent}
                      rounded-t-2xl 
                      p-3 sm:p-4
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                        {column.title}
                      </h3>
                      <Badge className="bg-white/30 dark:bg-black/30 backdrop-blur-sm border-white/20 text-slate-900 dark:text-white">
                        {columnTasks.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Column Body */}
                  <div
                    className={`
                      bg-white/10 dark:bg-black/10 
                      backdrop-blur-md 
                      border-x border-b border-white/20 ${column.accent}
                      rounded-b-2xl 
                      flex-none
                      p-2 sm:p-3 md:p-4
                    `}
                  >
                    <div
                      ref={(el) => {
                        scrollContainersRef.current[column.id] = el as HTMLDivElement | null;
                      }}
                      className="mobile-no-scrollbar flex snap-x snap-mandatory flex-row items-stretch gap-3 overflow-x-auto overflow-y-hidden rounded-xl p-1 sm:p-2"
                    >
                      {columnTasks.map((task, index) => (
                        <MobileTaskCard
                          key={task._id}
                          task={task}
                          index={index}
                          columnId={column.id}
                        />
                      ))}
                    </div>

                    {columnTasks.length > 1 && (
                      <div className="mt-2 flex items-center justify-center gap-2">
                        {columnTasks.map((_, i) => {
                          const active = (activeIndexByCol[column.id] ?? 0) === i;
                          return (
                            <button
                              key={i}
                              type="button"
                              aria-label={`Go to card ${i + 1}`}
                              onClick={() => scrollToCard(column.id, i)}
                              className={`
                                h-1.5 rounded-full transition-all
                                ${active ? "w-5 bg-slate-900/80 dark:bg-white/80" : "w-1.5 bg-slate-500/40"}
                              `}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:gap-8 lg:grid-cols-3">
              {columns.map((column) => {
                const columnTasks = getTasksForColumn(column.id);
                cardRefsRef.current[column.id] ||= [];

                return (
                  <div key={column.id} className="flex flex-col lg:min-h-[600px]">
                    {/* Column Header */}
                    <div
                      className={`
                        sticky top-0 z-10
                        bg-white/40 dark:bg-black/40 
                        backdrop-blur-md 
                        border border-white/20 ${column.accent}
                        rounded-t-2xl 
                        p-3 sm:p-4
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 dark:text-white">
                          {column.title}
                        </h3>
                        <Badge className="bg-white/30 dark:bg-black/30 backdrop-blur-sm border-white/20 text-slate-900 dark:text-white">
                          {columnTasks.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Column Body */}
                    <div
                      className={`
                        bg-white/10 dark:bg-black/10 
                        backdrop-blur-md 
                        border-x border-b border-white/20 ${column.accent}
                        rounded-b-2xl 
                        flex-1
                        p-2 sm:p-3 md:p-4
                        overflow-y-auto
                        overscroll-contain
                      `}
                    >
                      <Droppable droppableId={column.id} direction="vertical">
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`
                              min-h-[500px] rounded-xl p-1 sm:p-2
                              space-y-3 md:space-y-4 transition-all duration-300
                              ${snapshot.isDraggingOver ? "bg-blue-500/15 backdrop-blur-lg" : ""}
                            `}
                          >
                            {columnTasks.map((task, index) => (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided, snapshot) => {
                                  const card = (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      data-index={index}
                                      className={`
                                        bg-white/20 dark:bg-black/20 
                                        backdrop-blur-md 
                                        border border-white/20 
                                        rounded-xl 
                                        p-4 md:p-5
                                        transition-all duration-300
                                        ${
                                          snapshot.isDragging
                                            ? "shadow-2xl bg-white/30 dark:bg-black/30"
                                            : "hover:bg-white/25 dark:hover:bg-black/25 hover:shadow-lg"
                                        }
                                      `}
                                      style={
                                        snapshot.isDragging
                                          ? withExtraTransform(
                                              provided.draggableProps.style,
                                              "rotate(2deg) scale(1.05)"
                                            )
                                          : (provided.draggableProps.style as React.CSSProperties)
                                      }
                                    >
                                      {/* Task Header */}
                                      <div className="mb-2 sm:mb-3 flex items-start justify-between">
                                        <div className="flex flex-1 items-center gap-2">
                                          <Badge
                                            className={`
                                              ${getPriorityColor(task.priority)} 
                                              text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 
                                              backdrop-blur-sm 
                                              border
                                            `}
                                          >
                                            {task.priority}
                                          </Badge>
                                          {isOverdue(task.dueDate) && task.status !== "Completed" && (
                                            <AlertCircle className="h-4 w-4 text-red-400 animate-pulse" />
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <EditDeleteMenu task={task} />
                                          <div
                                            {...provided.dragHandleProps}
                                            className="
                                              touch-none rounded-lg p-2 sm:p-3 
                                              hover:bg-white/20 dark:hover:bg-black/20 
                                              cursor-grab active:cursor-grabbing 
                                              transition-colors
                                            "
                                          >
                                            <GripVertical className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Task Content */}
                                      <div className="space-y-2 sm:space-y-3">
                                        <h4 className="text-sm md:text-[15px] font-semibold text-slate-900 dark:text-white leading-tight capitalize">
                                          {task.title}
                                        </h4>

                                        {task.description && (
                                          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">
                                            {task.description}
                                          </p>
                                        )}

                                        {task.dueDate && (
                                          <div
                                            className={`
                                              flex items-center gap-2 text-[11px] sm:text-xs md:text-[13px]
                                              px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg
                                              backdrop-blur-sm
                                              ${
                                                isOverdue(task.dueDate) && task.status !== "Completed"
                                                  ? "bg-red-500/20 text-red-300 border border-red-400/30"
                                                  : "bg-white/10 dark:bg-black/10 text-slate-600 dark:text-slate-400 border border-white/10"
                                              }
                                            `}
                                          >
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                              {format(new Date(task.dueDate), "MMM d, yyyy")}
                                              {isOverdue(task.dueDate) && task.status !== "Completed" && (
                                                <span className="ml-2 font-medium animate-pulse">Overdue</span>
                                              )}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );

                                  return snapshot.isDragging ? <DragPortal>{card}</DragPortal> : card;
                                }}
                              </Draggable>
                            ))}

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Status Change Modal */}
      <StatusChangeModal
        task={selectedTask}
        isOpen={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedTask(null);
        }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Kanban;