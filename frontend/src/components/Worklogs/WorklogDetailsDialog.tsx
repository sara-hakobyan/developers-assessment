import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate, formatDateTime, formatMoney } from "@/worklog-utils";
import { TimeEntry, WorklogWithFreelancer } from "@/types";

type Props = {
  open: boolean;
  worklog: WorklogWithFreelancer | null;
  entries: TimeEntry[];
  onOpenChange: (open: boolean) => void;
};

export function WorklogDetailsDialog({
  open,
  worklog,
  entries,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{worklog?.taskTitle}</DialogTitle>
          <DialogDescription>
            {worklog?.freelancer.fullName} · {worklog?.freelancer.email}
            {worklog ? (
              <span className="font-medium text-primary">
                {" "}
                · {formatMoney(worklog.freelancer.hourlyRate)}/hr
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {worklog && (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <Card className="gap-2 py-4">
                <CardContent className="px-4">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="font-medium capitalize">{worklog.status}</div>
                </CardContent>
              </Card>

              <Card className="gap-2 py-4">
                <CardContent className="px-4">
                  <div className="text-xs text-muted-foreground">
                    Worklog period
                  </div>
                  <div className="font-medium text-sm">
                    {formatDate(worklog.periodStart)} -{" "}
                    {formatDate(worklog.periodEnd)}
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-2 py-4">
                <CardContent className="px-4">
                  <div className="text-xs text-muted-foreground">
                    Total earnings
                  </div>
                  <div className="font-medium">
                    {formatMoney(worklog.totalEarnings)}
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-2 py-4">
                <CardContent className="px-4">
                  <div className="text-xs text-muted-foreground">
                    Submitted at
                  </div>
                  <div className="font-medium text-sm">
                    {worklog.submittedAt
                      ? formatDateTime(worklog.submittedAt)
                      : "-"}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Time entries</h3>

              {entries.length ? (
                entries.map((entry) => (
                  <div key={entry.id} className="rounded-lg border p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{entry.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(entry.date)} · {entry.hours}h
                        </div>
                      </div>

                      <div className="font-medium">
                        {formatMoney(entry.amount)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                  No time entries found for this worklog.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
