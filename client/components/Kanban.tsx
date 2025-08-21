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

    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);

    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
    } else {
      (mq as MediaQueryList).addListener(onChange); // legacy Safari
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", onChange);
      } else {
        (mq as MediaQueryList).removeListener(onChange);
      }
    };
  }, [breakpointPx]);

  return isMobile;
};

/* ---------------------- priority colors ---------------------- */
type Priority = "High" | "Medium" | "Low";

const getPriorityColor = (priority: Priority) => {
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

/* ---------------------- Mobile Task Card ---------------------- */
interface MobileTaskCardProps {
  task: Task;
  index: number;
  columnId: string;
}

const MobileTaskCard: React.FC<MobileTaskCardProps> = ({ task, index, columnId }) => {
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const updateTask = useTaskStore((s) => s.updateTask);

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
            className="relative mb-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            onClick={() => setShowStatusModal(true)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {task.description}
                  </p>
                )}
              </div>
              <span className="cursor-grab text-slate-400">
                <GripVertical className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                className={`${getPriorityColor(task.priority as Priority)} border text-xs font-medium`}
              >
                {task.priority}
              </Badge>
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs
                  ${
                    new Date(task.dueDate) < new Date() && task.status !== "Completed"
                      ? "border-red-400/30 bg-red-500/20 text-red-700 dark:text-red-400"
                      : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(task.dueDate), "MMM d")}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>

      {showStatusModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-lg dark:bg-slate-800">
              <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Update Status
              </h2>
              <div className="flex flex-col gap-2">
                {["To Do", "In Progress", "Completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      updateTask({ ...task, status: status as TaskStatus });
                      setShowStatusModal(false);
                    }}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors
                      ${
                        task.status === status
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                      }`}
                  >
                    <span>{status}</span>
                    {task.status === status && <ChevronRight className="h-4 w-4" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="mt-4 w-full rounded-md bg-slate-200 py-2 text-sm text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

/* ---------------------- Main Kanban ---------------------- */
export default function Kanban() {
  const { tasks, updateTask } = useTaskStore();
  const isMobile = useIsMobile();

  const groupedTasks = React.useMemo(() => {
    return tasks.reduce((acc: Record<string, Task[]>, task) => {
      acc[task.status] = acc[task.status] || [];
      acc[task.status].push(task);
      return acc;
    }, {});
  }, [tasks]);

const onDragEnd = (result: DropResult) => {
  if (!result.destination) return;

  const { draggableId, destination } = result;
  const task = tasks.find((t) => t._id === draggableId);
  if (!task) return;

  const newStatus = destination.droppableId as TaskStatus;

  if (task.status !== newStatus) {
    updateTask({ ...task, status: newStatus });
  
  }
};

  return (
    <div className="flex h-full w-full flex-col">
      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className={`flex h-full gap-4 overflow-x-auto ${
            isMobile ? "flex-col" : "flex-row"
          }`}
        >
          {["To Do", "In Progress", "Completed"].map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex min-w-[300px] flex-1 flex-col rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {status}
                  </h2>
                  <div className="flex-1">
                    {(groupedTasks[status] || []).map((task, index) => (
                      <MobileTaskCard
                        key={task._id}
                        task={task}
                        index={index}
                        columnId={status}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
