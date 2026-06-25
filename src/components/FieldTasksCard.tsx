import React, { useMemo, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FieldOfficerTask } from "@/lib/types";

type Props = {
  tasks: FieldOfficerTask[];
  onToggle: (id: number) => void;
  controls?: ReactNode;
};

export const FieldTasksCard: React.FC<Props> = ({ tasks, onToggle, controls }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const parsed = useMemo(() => {
    const list = tasks || [];
    const dateField: "dueDate" | "date" | "" = list.find((t) => !!t.dueDate) ? "dueDate" : (list.find((t) => !!t.date) ? "date" : "");

    const filtered = list.filter((task) => {
      if (!dateField || (!fromDate && !toDate)) return true;
      const raw = String(task[dateField] || "");
      if (!raw) return true;
      const d = new Date(raw);
      if (fromDate) {
        const f = new Date(fromDate);
        if (d < f) return false;
      }
      if (toDate) {
        const t = new Date(toDate);
        // include day
        t.setHours(23, 59, 59, 999);
        if (d > t) return false;
      }
      return true;
    });

    const pending = filtered.filter((t) => !t.completed).length;
    const completed = filtered.filter((t) => t.completed).length;

    return { filtered, pending, completed };
  }, [tasks, fromDate, toDate]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">Field Officer Tasks</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Live sheet-backed tasks with date filtering and completion status.</p>
          </div>
          {controls ? <div className="min-w-0">{controls}</div> : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/20 p-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs">
              <label className="text-muted-foreground">From</label>
              <input className="rounded-md border bg-background px-2 py-0.5 text-sm" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="text-muted-foreground">To</label>
              <input className="rounded-md border bg-background px-2 py-0.5 text-sm" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge>Pending: {parsed.pending}</Badge>
            <Badge variant="secondary">Completed: {parsed.completed}</Badge>
          </div>
        </div>

        <div className="mt-2 space-y-2 max-h-48 overflow-auto">
          {parsed.filtered.length ? (
            parsed.filtered.map((task) => (
              <div key={task.id} className="flex items-center justify-between gap-3 rounded-md border p-1">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{task.task}</div>
                  <div className="text-xs text-muted-foreground">{task.village || "-"}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground">{task.dueDate || task.date || ""}</div>
                  <Button size="sm" variant={task.completed ? "outline" : "default"} onClick={() => onToggle(task.id)}>
                    {task.completed ? "Mark Pending" : "Mark Done"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground">No tasks found for selected range.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldTasksCard;
