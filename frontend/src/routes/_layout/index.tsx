import { createFileRoute } from "@tanstack/react-router";

import { DataTable } from "@/components/Common/DataTable";
import PendingWorklogs from "@/components/Pending/PendingWorklogs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WorklogFilters } from "@/components/Worklogs/WorklogFilters";
import { WorklogDetailsDialog } from "@/components/Worklogs/WorklogDetailsDialog";
import { PaymentBatchReviewDialog } from "@/components/Worklogs/PaymentBatchReviewDialog";
import { useWorklogDashboard } from "@/hooks/useWorklogDashboard";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
  head: () => ({
    meta: [
      {
        title: "Dashboard - WorkLog Payment Dashboard",
      },
    ],
  }),
});

function Dashboard() {
  const {
    activeWorklog,
    activeWorklogEntries,
    appliedFilters,
    columns,
    excludedBatchWorklogIds,
    expandedBatchWorklogIds,
    filteredRows,
    handleBatchReviewOpenChange,
    handleConfirmPayment,
    handleOpenBatchReview,
    isBatchReviewOpen,
    isConfirmingPayment,
    isError,
    isLoading,
    reviewableSelectedCount,
    rows,
    reviewableTimeEntries,
    selectedBatchTotal,
    selectedEntriesTotalHours,
    selectedWorklogs,
    setActiveWorklogId,
    setAppliedFilters,
    toggleBatchWorklogEntries,
    toggleBatchWorklogInclusion,
  } = useWorklogDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            WorkLog Payment Dashboard
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            List of all worklogs with total earnings per task.
          </p>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Worklogs</CardTitle>
            <CardDescription>
              Review all worklogs and their total earnings.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <PendingWorklogs />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <section className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            WorkLog Payment Dashboard
          </h1>
          <p className="text-destructive">Failed to load mock worklog data.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          WorkLog Payment Dashboard
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          List of all worklogs with total earnings per task.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Worklogs</CardTitle>
          <CardDescription>
            Review all worklogs and their total earnings.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <WorklogFilters
            appliedValue={appliedFilters}
            totalCount={rows.length}
            filteredCount={filteredRows.length}
            selectedReviewCount={reviewableSelectedCount}
            onApply={setAppliedFilters}
            onReviewSelected={handleOpenBatchReview}
          />

          <DataTable columns={columns} data={filteredRows} />
        </CardContent>
      </Card>

      <WorklogDetailsDialog
        open={Boolean(activeWorklog)}
        worklog={activeWorklog}
        entries={activeWorklogEntries}
        onOpenChange={(open) => {
          if (!open) {
            setActiveWorklogId(null);
          }
        }}
      />

      <PaymentBatchReviewDialog
        open={isBatchReviewOpen}
        onOpenChange={handleBatchReviewOpenChange}
        selectedWorklogs={selectedWorklogs}
        selectedTimeEntries={reviewableTimeEntries}
        selectedEntriesTotalHours={selectedEntriesTotalHours}
        selectedBatchTotal={selectedBatchTotal}
        excludedBatchWorklogIds={excludedBatchWorklogIds}
        expandedBatchWorklogIds={expandedBatchWorklogIds}
        onToggleWorklogInclusion={toggleBatchWorklogInclusion}
        onToggleBatchWorklogEntries={toggleBatchWorklogEntries}
        onConfirmPayment={handleConfirmPayment}
        isConfirmingPayment={isConfirmingPayment}
      />
    </div>
  );
}
