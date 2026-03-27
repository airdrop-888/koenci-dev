import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CopyToClipboardButton } from "@/components/shared/CopyToClipboardButton";
import { StatusBadge, LicenseStatus } from "@/components/shared/StatusBadge";
import { ArrowLeft, KeyRound, CalendarDays, KeyIcon } from "lucide-react";
import Link from "next/link";
import { generateLicense } from "@/lib/actions/license";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || '';

  const [
    { data: project, error: projError },
    { data: licenses, error: licError }
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).eq("owner_id", userId).single(),
    supabase.from("licenses").select("*").eq("project_id", id).order("created_at", { ascending: false }),
  ]);

  if (projError || !project) {
    return (
      <div className="flex flex-col gap-4 text-center py-20">
        <h2 className="text-2xl font-bold text-white">Project not found</h2>
        <Link href="/dashboard/projects">
          <Button variant="outline" className="text-zinc-400 border-zinc-800">Return to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{project.name}</h2>
          <p className="text-zinc-400 mt-1 font-mono text-xs">{project.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-400">Created At</h3>
          </div>
          <p className="text-xl font-medium text-zinc-200">
            {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <KeyIcon className="h-4 w-4 text-zinc-500" />
            <h3 className="text-sm font-medium text-zinc-400">Total Licenses</h3>
          </div>
          <p className="text-xl font-medium text-emerald-500">
            {licenses?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 flex flex-col justify-between items-center bg-gradient-to-br from-zinc-900 to-emerald-900/10">
          <h3 className="text-sm font-medium text-zinc-400 mb-4 whitespace-nowrap">Need a new key?</h3>
          <form action={generateLicense} className="w-full">
            <input type="hidden" name="projectId" value={project.id} />
            <Button type="submit" className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
              <KeyRound className="mr-2 h-4 w-4" /> Generate License
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium text-white mb-4">License Keys</h3>
        <div className="rounded-md border border-zinc-800 bg-zinc-950 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="hover:bg-transparent border-zinc-800">
                <TableHead className="text-zinc-400 w-[300px]">License Key</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">HWID Lock</TableHead>
                <TableHead className="text-zinc-400">Expires At</TableHead>
                <TableHead className="text-zinc-400">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses && licenses.length > 0 ? (
                licenses.map((lic) => (
                  <TableRow key={lic.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded bg-zinc-900 text-sm text-zinc-300 border border-zinc-800">
                          {lic.key_string}
                        </code>
                        <CopyToClipboardButton value={lic.key_string} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={(lic.status as LicenseStatus) || "unused"} />
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {lic.hwid || "Not locked"}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {lic.expires_at ? new Date(lic.expires_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {new Date(lic.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                    No licenses found for this project.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
