import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyToClipboardButton } from "@/components/shared/CopyToClipboardButton";
import { StatusBadge, LicenseStatus } from "@/components/shared/StatusBadge";
import { KeyRound, Plus, Users, FolderGit2, ShieldAlert } from "lucide-react";
import { AddProjectButton } from "@/components/dashboard/AddProjectButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    { count: totalProjects, error: err1 },
    { count: activeLicenses, error: err2 },
    { count: totalUsers, error: err3 },
    { data: recentLicenses, error: err4 },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("licenses").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("licenses").select("*, projects(name)").order("created_at", { ascending: false }).limit(5),
  ]);

  // Gracefully handle query errors (e.g. missing tables or RLS blocks)
  const hasErrors = err1 || err2 || err3 || err4;
  if (hasErrors) {
    console.warn("Supabase data fetch errors on dashboard:", { err1, err2, err3, err4 });
  }

  const metrics = [
    { title: "Total Projects", value: totalProjects || 0, icon: FolderGit2, trend: "Live data" },
    { title: "Active Licenses", value: activeLicenses || 0, icon: KeyRound, trend: "Live data" },
    { title: "Total Users", value: totalUsers || 0, icon: Users, trend: "Live data" },
    { title: "Blocked Requests", value: "0", icon: ShieldAlert, trend: "Live data" },
  ];

  const formattedLicenses = recentLicenses?.map((lic) => {
    // Supabase inner joins return related rows in a nested object or array depending on relation.
    // For many-to-one (license -> project), it returns an object.
    const projectName =
      lic.projects && !Array.isArray(lic.projects)
        ? lic.projects.name
        : "Unknown Project";

    return {
      id: lic.id,
      project: projectName,
      keyString: lic.key_string || "N/A",
      status: (lic.status as LicenseStatus) || "unused",
      hwid: lic.hwid || "Not locked",
      expiresAt: lic.expires_at
        ? new Date(lic.expires_at).toISOString().split("T")[0]
        : "Never",
    };
  }) || [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h2>
          <p className="text-zinc-400 mt-1">Monitor your projects and license activity.</p>
        </div>
        <AddProjectButton className="hidden sm:flex" />
      </div>

      {hasErrors && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-md text-sm">
          <strong>Database Connection Error:</strong> Unable to load complete data. Verify your Supabase keys/RLS settings or check the console logs.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="bg-zinc-950 border-zinc-800 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-50">{metric.value}</div>
              <p className="text-xs text-zinc-500 mt-1">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-medium text-white mb-4">Recent Licenses</h3>
        <div className="rounded-md border border-zinc-800 bg-zinc-950 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-900/50">
              <TableRow className="hover:bg-transparent border-zinc-800">
                <TableHead className="text-zinc-400">Project</TableHead>
                <TableHead className="text-zinc-400">License Key</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">HWID Lock</TableHead>
                <TableHead className="text-zinc-400">Expires At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formattedLicenses.length > 0 ? (
                formattedLicenses.map((license) => (
                  <TableRow key={license.id} className="border-zinc-800 hover:bg-zinc-900/50 transition-colors">
                    <TableCell className="font-medium text-zinc-200">
                      {license.project}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded bg-zinc-900 text-sm text-zinc-300 border border-zinc-800">
                          {license.keyString}
                        </code>
                        <CopyToClipboardButton value={license.keyString} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={license.status} />
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {license.hwid}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {license.expiresAt}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                    {hasErrors ? "Data unavailable" : "No licenses found"}
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
