import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, MessageCircle, Send, Siren, Syringe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { listAlerts } from "@/lib/dataService";
import { toast } from "@/components/ui/use-toast";

const iconMap: Record<string, typeof Bell> = {
  "Vaccine Due": Syringe,
  "Disease Outbreak": Siren,
  "Pregnancy Due": Bell,
  "Critical Health": AlertTriangle,
  Notifications: MessageCircle,
};

const AlertsPage = () => {
  const { data: alerts = [] } = useQuery({ queryKey: ["alerts"], queryFn: listAlerts, initialData: [] });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Alerts & Notifications" description="Vaccine due alerts, disease outbreak alerts, pregnancy due alerts, critical health alerts and SMS / WhatsApp notification workflow.">
          <Button variant="outline" onClick={() => toast({ title: "WhatsApp queue prepared", description: "Priority notifications moved to outreach queue." })}><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</Button>
          <Button onClick={() => toast({ title: "SMS sent", description: "Demo SMS notifications dispatched." })}><Send className="mr-2 h-4 w-4" /> Send SMS</Button>
        </PageHeader>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {alerts.map((item) => {
            const Icon = iconMap[item.type] || Bell;
            return (
              <Card key={item.id} className={item.priority === "High" ? "border-destructive/40" : ""}>
                <CardContent className="flex gap-4 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className={item.priority === "High" ? "h-5 w-5 text-destructive" : "h-5 w-5 text-primary"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={item.priority === "High" ? "destructive" : "secondary"}>{item.priority}</Badge>
                      <span className="text-xs text-muted-foreground">{item.type} · {item.time}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-5">{item.message}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AlertsPage;
