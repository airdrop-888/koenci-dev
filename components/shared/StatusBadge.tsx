import { Badge } from "@/components/ui/badge";

export type LicenseStatus = "active" | "banned" | "unused" | "expired";

interface StatusBadgeProps {
  status: LicenseStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border-emerald-500/20"
        >
          Active
        </Badge>
      );
    case "banned":
      return (
        <Badge
          variant="secondary"
          className="bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 border-rose-500/20"
        >
          Banned
        </Badge>
      );
    case "unused":
      return (
        <Badge
          variant="secondary"
          className="bg-zinc-500/15 text-zinc-400 hover:bg-zinc-500/25 border-zinc-500/20"
        >
          Unused
        </Badge>
      );
    case "expired":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border-amber-500/20"
        >
          Expired
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
