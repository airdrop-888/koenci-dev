"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createProject } from "@/lib/actions/project";
import { useRouter } from "next/navigation";

interface AddProjectButtonProps {
  className?: string;
}

export function AddProjectButton({ className }: AddProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createProject(formData);
      setOpen(false); // Close Modal
      router.refresh(); // Refresh Client Router to ensure synced state
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className={`bg-emerald-500 text-black hover:bg-emerald-400 transition-colors ${className || ""}`} />}>
        <Plus className="mr-2 h-4 w-4" /> Add Project
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-zinc-400">
                Project Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Molty Royale Bot"
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-emerald-500"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 text-black hover:bg-emerald-400"
            >
              {loading ? "Saving..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
