import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { WorklogFiltersValue } from "@/types";
import { DEFAULT_FILTERS } from "@/constants";

type WorklogFiltersProps = {
  appliedValue: WorklogFiltersValue;
  totalCount: number;
  filteredCount: number;
  selectedReviewCount: number;
  onApply: (value: WorklogFiltersValue) => void;
  onReviewSelected: () => void;
};

export function WorklogFilters({
  appliedValue,
  totalCount,
  filteredCount,
  selectedReviewCount,
  onApply,
  onReviewSelected,
}: WorklogFiltersProps) {
  const [draftFilters, setDraftFilters] =
    useState<WorklogFiltersValue>(appliedValue);

  useEffect(() => {
    setDraftFilters(appliedValue);
  }, [appliedValue]);

  const hasInvalidDateRange = Boolean(
    draftFilters.fromDate &&
    draftFilters.toDate &&
    draftFilters.fromDate > draftFilters.toDate
  );

  const isClearDisabled =
    draftFilters.fromDate === "" &&
    draftFilters.toDate === "" &&
    draftFilters.statusFilter === "all";

  const resultLabel =
    filteredCount === totalCount
      ? `${totalCount} total worklogs`
      : `${filteredCount} matching worklogs`;

  const handleSearch = () => {
    if (hasInvalidDateRange) return;
    onApply(draftFilters);
  };

  const handleClear = () => {
    setDraftFilters(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <label
              htmlFor="from-date"
              className="text-sm font-medium text-foreground"
            >
              From
            </label>
            <input
              id="from-date"
              type="date"
              value={draftFilters.fromDate}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  fromDate: event.target.value,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="to-date"
              className="text-sm font-medium text-foreground"
            >
              To
            </label>
            <input
              id="to-date"
              type="date"
              value={draftFilters.toDate}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  toDate: event.target.value,
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="status-filter"
              className="text-sm font-medium text-foreground"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={draftFilters.statusFilter}
              onChange={(event) =>
                setDraftFilters((current) => ({
                  ...current,
                  statusFilter: event.target.value as
                    | "all"
                    | "submitted"
                    | "draft",
                }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSearch} disabled={hasInvalidDateRange}>
              Search
            </Button>

            <Button
              variant="outline"
              onClick={handleClear}
              disabled={isClearDisabled}
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">{resultLabel}</div>

          <Button
            onClick={onReviewSelected}
            disabled={selectedReviewCount === 0}
          >
            Review selected ({selectedReviewCount})
          </Button>
        </div>
      </div>

      {hasInvalidDateRange && (
        <p className="text-sm text-destructive">
          “From” date cannot be after “To” date.
        </p>
      )}
    </div>
  );
}
