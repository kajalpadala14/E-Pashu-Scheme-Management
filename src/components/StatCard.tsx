import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  tone?: "primary" | "blue" | "amber" | "red" | "slate";
}) {
  const tones = {
    primary: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    red: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  };

  return (
    <Card className="h-full overflow-hidden border-l-4 border-l-primary shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full items-center p-4">
        <div className="flex w-full items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold leading-none tracking-tight">{value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
          </div>
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105", tones[tone])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
