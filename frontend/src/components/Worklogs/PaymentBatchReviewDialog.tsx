import { useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { TimeEntry, WorklogWithFreelancer } from "@/types";
import { formatDate, formatMoney } from "@/worklog-utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWorklogs: WorklogWithFreelancer[];
  selectedTimeEntries: TimeEntry[];
  selectedBatchTotal: number;
  selectedEntriesTotalHours: number;
  excludedBatchWorklogIds: string[];
  expandedBatchWorklogIds: string[];
  onToggleWorklogInclusion: (worklogId: string) => void;
  onToggleBatchWorklogEntries: (worklogId: string) => void;
  onConfirmPayment: () => Promise<void>;
  isConfirmingPayment: boolean;
};

export function PaymentBatchReviewDialog({
  open,
  onOpenChange,
  selectedWorklogs,
  selectedTimeEntries,
  selectedEntriesTotalHours,
  selectedBatchTotal,
  excludedBatchWorklogIds,
  expandedBatchWorklogIds,
  onToggleWorklogInclusion,
  onToggleBatchWorklogEntries,
  onConfirmPayment,
  isConfirmingPayment,
}: Props) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isProcessingConfirmation, setIsProcessingConfirmation] =
    useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null
  );

  const freelancerCount = useMemo(
    () => new Set(selectedWorklogs.map((worklog) => worklog.freelancerId)).size,
    [selectedWorklogs]
  );

  const entriesByWorklogId = useMemo(() => {
    const grouped = new Map<string, TimeEntry[]>();

    selectedTimeEntries.forEach((entry) => {
      const current = grouped.get(entry.worklogId) ?? [];
      grouped.set(entry.worklogId, [...current, entry]);
    });

    return grouped;
  }, [selectedTimeEntries]);

  const payableWorklogs = useMemo(
    () => selectedWorklogs.filter((worklog) => worklog.status !== "submitted"),
    [selectedWorklogs]
  );

  const worklogReviewRows = useMemo(
    () =>
      payableWorklogs.map((worklog) => ({
        worklog,
        entries: entriesByWorklogId.get(worklog.id) ?? [],
        isExpanded: expandedBatchWorklogIds.includes(worklog.id),
        isExcluded: excludedBatchWorklogIds.includes(worklog.id),
      })),
    [
      payableWorklogs,
      entriesByWorklogId,
      expandedBatchWorklogIds,
      excludedBatchWorklogIds,
    ]
  );

  const hasReviewableWorklogs = worklogReviewRows.some(
    (row) => !row.isExcluded
  );

  const closeAllDialogs = () => {
    setIsConfirmDialogOpen(false);
    setIsProcessingConfirmation(false);
    setIsPaymentCompleted(false);
    setConfirmationError(null);
    onOpenChange(false);
  };

  const handleConfirmAndPay = async () => {
    setIsProcessingConfirmation(true);
    setConfirmationError(null);
    try {
      await onConfirmPayment();
      setConfirmedAmount(selectedBatchTotal);
      setIsPaymentCompleted(true);
    } catch (error) {
      console.error(error);
      setConfirmationError("Payment failed. Please try again.");
    } finally {
      setIsProcessingConfirmation(false);
    }
  };

  const handleConfirmDialogOpenChange = (nextOpen: boolean) => {
    if (isProcessingConfirmation) return;

    if (!nextOpen && isPaymentCompleted) {
      closeAllDialogs();
      return;
    }

    if (!nextOpen) {
      setConfirmationError(null);
    }

    setIsConfirmDialogOpen(nextOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review payment batch</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Submitted worklogs are excluded from payment review and cannot be
              repaid. You can exclude or include individual worklogs before
              confirming payment.
            </p>
            <DialogDescription>
              Review selected worklogs and included time entries before
              confirming payment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-4">
              <Card className="gap-2 py-4">
                <CardContent className="px-4">
                  <div className="text-xs text-muted-foreground">
                    Selected worklogs
                  </div>
                  <div className="font-medium">{selectedWorklogs.length}</div>
                </CardContent>
              </Card>

              <Card className="gap-2 py-4">
                <CardContent className="px-4">
                  <div className="text-xs text-muted-foreground">
                    Freelancers
                  </div>
                  <div className="font-medium">{freelancerCount}</div>
                </CardContent>
              </Card>

              <Card className="gap-2 border-primary/50 bg-primary/5 py-4">
                <CardContent className="px-4">
                  <div className="text-xs text-muted-foreground">
                    Total hours
                  </div>
                  <div className="font-semibold text-primary">
                    {selectedEntriesTotalHours}h
                  </div>
                </CardContent>
              </Card>

              <Card className="gap-2 border-primary/60 bg-primary/10 py-4">
                <CardContent className="px-4">
                  <div className="text-xs text-muted-foreground">
                    Batch total
                  </div>
                  <div className="font-semibold text-primary">
                    {formatMoney(selectedBatchTotal)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {worklogReviewRows.length ? (
                worklogReviewRows.map(
                  ({
                    worklog,
                    entries: worklogEntries,
                    isExpanded,
                    isExcluded,
                  }) => (
                    <div
                      key={worklog.id}
                      className={`space-y-4 rounded-lg border p-4 ${
                        isExcluded
                          ? "border-border"
                          : "border-primary/60 ring-1 ring-primary/30"
                      }`}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{worklog.taskTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            {worklog.freelancer.fullName} ·{" "}
                            {worklog.freelancer.email}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(worklog.periodStart)} -{" "}
                            {formatDate(worklog.periodEnd)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-8 px-2 text-muted-foreground"
                            onClick={() =>
                              onToggleBatchWorklogEntries(worklog.id)
                            }
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="mr-1 h-4 w-4" />
                                Hide included entries
                              </>
                            ) : (
                              <>
                                <ChevronDown className="mr-1 h-4 w-4" />
                                Show included entries ({worklogEntries.length})
                              </>
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-col items-start gap-2 md:items-end">
                          <div className="font-medium">
                            {formatMoney(worklog.totalEarnings)}
                          </div>

                          <div className="flex flex-wrap gap-2 md:justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className={
                                isExcluded
                                  ? "border-green-600/60 text-green-700 hover:bg-green-50 hover:text-green-800"
                                  : "border-red-600/60 text-red-700 hover:bg-red-50 hover:text-red-800"
                              }
                              onClick={() =>
                                onToggleWorklogInclusion(worklog.id)
                              }
                            >
                              {isExcluded
                                ? "Include worklog"
                                : "Exclude worklog"}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="space-y-2">
                          {worklogEntries.length ? (
                            worklogEntries.map((entry) => (
                              <div
                                key={entry.id}
                                className="flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-start md:justify-between"
                              >
                                <div>
                                  <div className="font-medium">
                                    {entry.description}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {formatDate(entry.date)} · {entry.hours}h @{" "}
                                    {formatMoney(entry.hourlyRate)}/hr
                                  </div>
                                </div>

                                <div className="font-medium">
                                  {formatMoney(entry.amount)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                              No time entries found for this worklog.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                )
              ) : (
                <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                  No worklogs remain in this payment batch.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>

              <Button
                onClick={() => setIsConfirmDialogOpen(true)}
                disabled={
                  isConfirmingPayment ||
                  isProcessingConfirmation ||
                  !hasReviewableWorklogs
                }
              >
                Confirm payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isConfirmDialogOpen}
        onOpenChange={handleConfirmDialogOpenChange}
      >
        <DialogContent className="sm:max-w-md">
          {!isPaymentCompleted ? (
            <>
              <DialogHeader>
                <DialogTitle>Confirm total payment</DialogTitle>
                <DialogDescription>Total amount to be paid:</DialogDescription>
              </DialogHeader>

              {confirmationError && (
                <p className="text-sm text-destructive">{confirmationError}</p>
              )}

              <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 text-center">
                <div className="text-2xl font-semibold text-primary">
                  {formatMoney(selectedBatchTotal)}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  disabled={isProcessingConfirmation}
                  onClick={() => setIsConfirmDialogOpen(false)}
                >
                  No
                </Button>
                <Button
                  disabled={isProcessingConfirmation || isConfirmingPayment}
                  onClick={handleConfirmAndPay}
                >
                  {isProcessingConfirmation ? "Processing..." : "Yes"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="space-y-3 text-center">
              <div className="text-sm text-muted-foreground">Amount paid</div>
              <div className="text-2xl font-semibold text-primary">
                {formatMoney(confirmedAmount)}
              </div>
              <div className="flex justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="flex justify-center pt-1">
                <Button onClick={closeAllDialogs}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
