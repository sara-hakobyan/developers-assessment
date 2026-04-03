import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import {
  confirmWorklogPayments,
  getFreelancers,
  getTimeEntries,
  getWorklogs,
} from "@/api/mock-service";
import { getWorklogColumns } from "@/components/Worklogs/columns";
import { DEFAULT_FILTERS } from "@/constants";
import { TimeEntry, WorklogFiltersValue, WorklogWithFreelancer } from "@/types";

const isRepayBlocked = (worklog: WorklogWithFreelancer) =>
  worklog.status === "submitted";

const toDateKey = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
};

export function useWorklogDashboard() {
  const [activeWorklogId, setActiveWorklogId] = useState<string | null>(null);
  const [selectedWorklogIds, setSelectedWorklogIds] = useState<string[]>([]);
  const [isBatchReviewOpen, setIsBatchReviewOpen] = useState(false);
  const [excludedBatchWorklogIds, setExcludedBatchWorklogIds] = useState<
    string[]
  >([]);
  const [appliedFilters, setAppliedFiltersState] =
    useState<WorklogFiltersValue>(DEFAULT_FILTERS);
  const [expandedBatchWorklogIds, setExpandedBatchWorklogIds] = useState<
    string[]
  >([]);

  const queryClient = useQueryClient();

  const {
    data: freelancers = [],
    isLoading: isFreelancersLoading,
    isError: isFreelancersError,
  } = useQuery({
    queryKey: ["mock-freelancers"],
    queryFn: getFreelancers,
  });

  const {
    data: worklogs = [],
    isLoading: isWorklogsLoading,
    isError: isWorklogsError,
  } = useQuery({
    queryKey: ["mock-worklogs"],
    queryFn: getWorklogs,
  });

  const {
    data: timeEntries = [],
    isLoading: isTimeEntriesLoading,
    isError: isTimeEntriesError,
  } = useQuery({
    queryKey: ["mock-time-entries"],
    queryFn: getTimeEntries,
  });

  const { mutateAsync: confirmPayments, isPending: isConfirmingPayment } =
    useMutation({
      mutationFn: confirmWorklogPayments,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["mock-worklogs"] });
      },
    });

  const isLoading =
    isFreelancersLoading || isWorklogsLoading || isTimeEntriesLoading;
  const isError = isFreelancersError || isWorklogsError || isTimeEntriesError;

  const rows = useMemo<WorklogWithFreelancer[]>(() => {
    return worklogs
      .map((worklog) => {
        const freelancer = freelancers.find(
          (item) => item.id === worklog.freelancerId
        );

        if (!freelancer) return null;

        return {
          ...worklog,
          freelancer,
        };
      })
      .filter((row): row is WorklogWithFreelancer => row !== null);
  }, [worklogs, freelancers]);

  const filteredRows = useMemo<WorklogWithFreelancer[]>(() => {
    const { fromDate, toDate, statusFilter } = appliedFilters;

    return rows.filter((row) => {
      const worklogStart = toDateKey(row.periodStart);
      const worklogEnd = toDateKey(row.periodEnd);

      if (fromDate && worklogStart < fromDate) return false;
      if (toDate && worklogEnd > toDate) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;

      return true;
    });
  }, [rows, appliedFilters]);

  const toggleBatchWorklogEntries = (worklogId: string) => {
    setExpandedBatchWorklogIds((current) =>
      current.includes(worklogId)
        ? current.filter((id) => id !== worklogId)
        : [...current, worklogId]
    );
  };

  const toggleBatchWorklogInclusion = (worklogId: string) => {
    setExcludedBatchWorklogIds((current) =>
      current.includes(worklogId)
        ? current.filter((id) => id !== worklogId)
        : [...current, worklogId]
    );
  };

  const toggleWorklogSelection = (worklogId: string, checked: boolean) => {
    setSelectedWorklogIds((current) => {
      if (checked) {
        return current.includes(worklogId) ? current : [...current, worklogId];
      }

      return current.filter((id) => id !== worklogId);
    });
  };

  const toggleSelectVisible = (worklogIds: string[], checked: boolean) => {
    setSelectedWorklogIds((current) => {
      if (checked) {
        const next = new Set(current);
        worklogIds.forEach((id) => next.add(id));
        return Array.from(next);
      }

      return current.filter((id) => !worklogIds.includes(id));
    });
  };

  const setAppliedFilters = (value: WorklogFiltersValue) => {
    setAppliedFiltersState(value);
    setSelectedWorklogIds([]);
    setExcludedBatchWorklogIds([]);
    setExpandedBatchWorklogIds([]);
    setIsBatchReviewOpen(false);
  };

  const activeWorklog =
    rows.find((worklog) => worklog.id === activeWorklogId) ?? null;

  const activeWorklogEntries = useMemo<TimeEntry[]>(() => {
    if (!activeWorklogId) return [];

    return timeEntries.filter((entry) => entry.worklogId === activeWorklogId);
  }, [activeWorklogId, timeEntries]);

  const selectedWorklogIdSet = useMemo(
    () => new Set(selectedWorklogIds),
    [selectedWorklogIds]
  );

  const selectedWorklogs = useMemo(() => {
    return rows.filter((worklog) => selectedWorklogIdSet.has(worklog.id));
  }, [rows, selectedWorklogIdSet]);

  useEffect(() => {
    const selectedIdSet = new Set(selectedWorklogIds);
    setExcludedBatchWorklogIds((current) =>
      current.filter((id) => selectedIdSet.has(id))
    );
  }, [selectedWorklogIds]);

  const reviewableSelectedWorklogs = useMemo(() => {
    return selectedWorklogs.filter(
      (worklog) =>
        !isRepayBlocked(worklog) &&
        !excludedBatchWorklogIds.includes(worklog.id)
    );
  }, [selectedWorklogs, excludedBatchWorklogIds]);

  const reviewableSelectedCount = reviewableSelectedWorklogs.length;

  const reviewableSelectedWorklogIds = useMemo(() => {
    return reviewableSelectedWorklogs.map((worklog) => worklog.id);
  }, [reviewableSelectedWorklogs]);

  const selectableSelectedWorklogIdSet = useMemo(
    () =>
      new Set(
        selectedWorklogs
          .filter((worklog) => !isRepayBlocked(worklog))
          .map((worklog) => worklog.id)
      ),
    [selectedWorklogs]
  );

  const selectableTimeEntries = useMemo(() => {
    return timeEntries.filter((entry) =>
      selectableSelectedWorklogIdSet.has(entry.worklogId)
    );
  }, [timeEntries, selectableSelectedWorklogIdSet]);

  const reviewableSelectedWorklogIdSet = useMemo(
    () => new Set(reviewableSelectedWorklogs.map((worklog) => worklog.id)),
    [reviewableSelectedWorklogs]
  );

  const reviewableTimeEntries = useMemo(() => {
    return timeEntries.filter((entry) =>
      reviewableSelectedWorklogIdSet.has(entry.worklogId)
    );
  }, [timeEntries, reviewableSelectedWorklogIdSet]);

  const selectedEntriesTotalHours = useMemo(() => {
    return reviewableTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  }, [reviewableTimeEntries]);

  const selectedBatchTotal = useMemo(() => {
    return reviewableSelectedWorklogs.reduce(
      (sum, worklog) => sum + worklog.totalEarnings,
      0
    );
  }, [reviewableSelectedWorklogs]);

  const handleOpenBatchReview = () => {
    if (!reviewableSelectedWorklogs.length) return;
    setIsBatchReviewOpen(true);
  };

  const handleBatchReviewOpenChange = (open: boolean) => {
    setIsBatchReviewOpen(open);

    if (!open) {
      setActiveWorklogId(null);
      setExpandedBatchWorklogIds([]);
      setExcludedBatchWorklogIds([]);
    }
  };

  const handleConfirmPayment = async () => {
    if (!reviewableSelectedWorklogIds.length) return;

    await confirmPayments(reviewableSelectedWorklogIds);

    setSelectedWorklogIds([]);
    handleBatchReviewOpenChange(false);
  };

  const columns = getWorklogColumns({
    selectedWorklogIds,
    isRepayBlocked,
    toggleSelectVisible,
    toggleWorklogSelection,
    onViewWorklog: setActiveWorklogId,
  });

  return {
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
    selectableTimeEntries,
    selectedBatchTotal,
    selectedEntriesTotalHours,
    selectedWorklogs,
    setActiveWorklogId,
    setAppliedFilters,
    toggleBatchWorklogEntries,
    toggleBatchWorklogInclusion,
  };
}
