import { cn } from "@/lib/utils";

type Status = "Healthy" | "Done" | "Pending" | "Due" | "Critical" | "Overdue" | "High" | "Medium" | "Low" | "Completed" | "In Progress";

const statusMap: Record<string, string> = {
  Healthy: "status-healthy",
  Done: "status-healthy",
  Completed: "status-healthy",
  Pending: "status-due",
  Due: "status-due",
  "In Progress": "status-due",
  Medium: "status-due",
  Low: "status-due",
  Critical: "status-critical",
  Overdue: "status-critical",
  High: "status-critical",
};

export function StatusBadge({ status }: { status: Status | string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusMap[status] || "status-due"
      )}
    >
      {status}
    </span>
  );
}
