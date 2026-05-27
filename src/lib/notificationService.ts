import type { AlertItem, ReminderItem } from "@/lib/types";
import { listAlerts, listReminders } from "@/lib/dataService";

export type NotificationType =
  | "vaccination_due"
  | "treatment_follow_up"
  | "emergency_alert"
  | "registration_reminder";

export interface NotificationEnvelope {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  severity: "high" | "medium" | "low";
  recipient: string;
  dueAt?: string;
}

export async function listNotificationFeed(): Promise<Array<AlertItem | ReminderItem>> {
  const [alerts, reminders] = await Promise.all([listAlerts(), listReminders()]);
  return [...alerts, ...reminders];
}

// TODO: integrate SMS/WhatsApp provider and queue worker for outbound delivery.
export async function dispatchNotificationPlaceholder(_payload: NotificationEnvelope): Promise<never> {
  throw new Error("Pending integration: outbound notification provider");
}
