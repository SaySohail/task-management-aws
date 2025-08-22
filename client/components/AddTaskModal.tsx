"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { EmptyTask } from "@/lib/constants";
import { useTaskStore } from "@/store/taskStore";
import { useModalStore } from "@/store/modalStore";
import { TaskPriority, TaskStatus } from "@/types/types";
import { useDashboardStore } from "@/store/dashboardStore";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { apiUrl } from "@/lib/api";

const AddTaskModal = () => {
  const { newTask, updateTask, setNewTask, addTask } = useTaskStore();
  const { isAddModalOpen, setIsAddModalOpen } = useModalStore();
  const { user } = useDashboardStore();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleAddModalClose = () => {
    if (submitting) return;
    setIsAddModalOpen(false);
    setNewTask(EmptyTask);
  };

  const notify = (title: string, description?: string) =>
    toast({
      title,
      description,
      // neutral glass toast to match app theme
      className:
        "bg-white/85 dark:bg-neutral-900/85 text-slate-900 dark:text-white border border-white/20 backdrop-blur-md",
      duration: 2200,
    });

  const handleAddTask = async () => {
    try {
      setSubmitting(true);

      if (newTask._id) {
        // update
        const res = await fetch(apiUrl("/api/updatetask"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...newTask }),
        });

        if (!res.ok) throw new Error("Failed to update task");

        updateTask(newTask);
        notify("Task Updated", "Your changes have been saved.");
      } else {
        // add
        const res = await fetch(apiUrl("/api/addtask"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ ...newTask, user: user?.email }),
        });

        if (!res.ok) throw new Error("Failed to add task");

        const data = await res.json();
        addTask(data.task);
        notify("Task Added", "The task was created successfully.");
      }
      setNewTask(EmptyTask);
      setIsAddModalOpen(false);
    } catch (err) {
      notify("Something went wrong", "Please try again.");
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isAddModalOpen} onOpenChange={handleAddModalClose}>
      <DialogContent
        className="
          w-full max-w-lg sm:max-w-xl md:max-w-2xl
          border border-white/20 bg-white/90 dark:bg-neutral-900/90
          backdrop-blur-xl shadow-[0_12px_48px_rgba(2,6,23,0.35)]
          p-5 sm:p-6 md:p-7
        "
      >
        {/* soft aurora tint on top edge */}
        <div className="pointer-events-none absolute -inset-px rounded-[inherit] [mask:linear-gradient(#000,transparent)] bg-gradient-to-br from-blue-500/15 via-indigo-400/15 to-violet-400/15" />

        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
            {newTask._id ? "Edit Task" : "Add New Task"}
          </DialogTitle>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Keep titles short and clear; descriptions can capture the details.
          </p>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-4 sm:space-y-5">
          {/* Title */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="title" className="text-sm text-slate-800 dark:text-slate-200">
              Title
            </Label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="e.g., Prepare Q3 review"
              className="
                sm:col-span-3
                bg-white/20 dark:bg-black/20 border-white/20
                hover:bg-white/30 dark:hover:bg-black/30 hover:border-white/30
                placeholder:text-slate-500 dark:placeholder:text-slate-400
                focus-visible:ring-1 focus-visible:ring-slate-300/30 focus-visible:border-slate-200/50
                dark:focus-visible:ring-slate-500/30 dark:focus-visible:border-slate-400/50
                transition-all duration-200
              "
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-start gap-2 sm:gap-4">
            <Label htmlFor="description" className="text-sm pt-2 text-slate-800 dark:text-slate-200">
              Description
            </Label>
            <Textarea
              id="description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              placeholder="Briefly describe the task…"
              className="
                sm:col-span-3 min-h-[96px]
                bg-white/20 dark:bg-black/20 border-white/20
                hover:bg-white/30 dark:hover:bg-black/30 hover:border-white/30
                placeholder:text-slate-500 dark:placeholder:text-slate-400
                focus-visible:ring-1 focus-visible:ring-slate-300/30 focus-visible:border-slate-200/50
                dark:focus-visible:ring-slate-500/30 dark:focus-visible:border-slate-400/50
                transition-all duration-200
              "
            />
          </div>

          {/* Status */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="status" className="text-sm text-slate-800 dark:text-slate-200">
              Status
            </Label>
            <Select
              value={newTask.status}
              onValueChange={(value) =>
                setNewTask({ ...newTask, status: value as TaskStatus })
              }
            >
              <SelectTrigger
                id="status"
                className="
                  sm:col-span-3
                  bg-white/20 dark:bg-black/20 border-white/20
                  hover:bg-white/30 dark:hover:bg-black/30 hover:border-white/30
                  focus-visible:ring-1 focus-visible:ring-slate-300/30 focus-visible:border-slate-200/50
                  dark:focus-visible:ring-slate-500/30 dark:focus-visible:border-slate-400/50
                  transition-all duration-200
                "
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-neutral-900/95 border-white/20 backdrop-blur-md">
                <SelectItem value="To Do">To Do</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="priority" className="text-sm text-slate-800 dark:text-slate-200">
              Priority
            </Label>
            <Select
              value={newTask.priority}
              onValueChange={(value) =>
                setNewTask({ ...newTask, priority: value as TaskPriority })
              }
            >
              <SelectTrigger
                id="priority"
                className="
                  sm:col-span-3
                  bg-white/20 dark:bg-black/20 border-white/20
                  hover:bg-white/30 dark:hover:bg-black/30 hover:border-white/30
                  focus-visible:ring-1 focus-visible:ring-slate-300/30 focus-visible:border-slate-200/50
                  dark:focus-visible:ring-slate-500/30 dark:focus-visible:border-slate-400/50
                  transition-all duration-200
                "
              >
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-neutral-900/95 border-white/20 backdrop-blur-md">
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
            <Label htmlFor="dueDate" className="text-sm text-slate-800 dark:text-slate-200">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={newTask.dueDate ? format(new Date(newTask.dueDate), "yyyy-MM-dd") : ""}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  dueDate: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="
                sm:col-span-3 max-w-[220px] sm:max-w-none
                bg-white/20 dark:bg-black/20 border-white/20
                hover:bg-white/30 dark:hover:bg-black/30 hover:border-white/30
                focus-visible:ring-1 focus-visible:ring-slate-300/30 focus-visible:border-slate-200/50
                dark:focus-visible:ring-slate-500/30 dark:focus-visible:border-slate-400/50
                transition-all duration-200
              "
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={handleAddModalClose}
            disabled={submitting}
            className="w-full sm:w-auto text-slate-900 dark:text-white hover:bg-white/20 dark:hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleAddTask}
            disabled={submitting}
            className="
              w-full sm:w-auto
              bg-gradient-to-br from-blue-600 to-indigo-700 text-white
              hover:from-blue-600/90 hover:to-indigo-700/90
              shadow-[0_6px_20px_rgba(59,130,246,0.35)]
            "
          >
            {submitting ? "Saving…" : newTask._id ? "Save Changes" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;