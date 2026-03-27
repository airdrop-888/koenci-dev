import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FolderGit2 } from "lucide-react";
import Link from "next/link";
import { AddProjectButton } from "@/components/dashboard/AddProjectButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '';

  const { data: projects, error } = await supabase.from("projects").select("*").eq("owner_id", userId).order("created_at", { ascending: false });

  if (error) {
    console.warn("Error fetching projects:", error);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Projects</h2>
          <p className="text-zinc-400 mt-1">Manage all your projects here.</p>
        </div>
        <AddProjectButton />
      </div>

      <div className="rounded-md border border-zinc-800 bg-zinc-950 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-400">ID</TableHead>
              <TableHead className="text-zinc-400">Name</TableHead>
              <TableHead className="text-zinc-400">Created At</TableHead>
              <TableHead className="text-zinc-400 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                  <TableCell className="font-mono text-zinc-500 text-xs">
                    {project.id}
                  </TableCell>
                  <TableCell className="font-medium text-emerald-500">
                    <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-2 hover:underline">
                      <FolderGit2 className="h-4 w-4" />
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button variant="outline" size="sm" className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell colSpan={4} className="text-center py-8 text-zinc-500">
                  No projects found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
