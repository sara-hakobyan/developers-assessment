import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorklogWithFreelancer } from "@/types";
import { formatDate, formatMoney } from "@/worklog-utils";

type GetWorklogColumnsParams = {
  selectedWorklogIds: string[];
  isRepayBlocked: (worklog: WorklogWithFreelancer) => boolean;
  toggleSelectVisible: (worklogIds: string[], checked: boolean) => void;
  toggleWorklogSelection: (worklogId: string, checked: boolean) => void;
  onViewWorklog: (worklogId: string) => void;
};

type SelectAllPayableCheckboxProps = {
  allSelected: boolean;
  partiallySelected: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
};

const SelectAllPayableCheckbox = ({
  allSelected,
  partiallySelected,
  disabled,
  onChange,
}: SelectAllPayableCheckboxProps) => {
  const checkboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!checkboxRef.current) return;
    checkboxRef.current.indeterminate = partiallySelected;
  }, [partiallySelected]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      aria-label="Select all payable visible worklogs"
      checked={allSelected}
      disabled={disabled}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
};

export const getWorklogColumns = ({
  selectedWorklogIds,
  isRepayBlocked,
  toggleSelectVisible,
  toggleWorklogSelection,
  onViewWorklog,
}: GetWorklogColumnsParams): ColumnDef<WorklogWithFreelancer>[] => [
  {
    id: "select",
    header: ({ table }) => {
      const payableVisibleRows = table
        .getRowModel()
        .rows.map((row) => row.original)
        .filter((row) => !isRepayBlocked(row));

      const visiblePayableIds = payableVisibleRows.map((row) => row.id);

      const allPayableVisibleSelected =
        visiblePayableIds.length > 0 &&
        visiblePayableIds.every((id) => selectedWorklogIds.includes(id));

      const somePayableVisibleSelected =
        visiblePayableIds.some((id) => selectedWorklogIds.includes(id)) &&
        !allPayableVisibleSelected;

      return (
        <SelectAllPayableCheckbox
          allSelected={allPayableVisibleSelected}
          partiallySelected={somePayableVisibleSelected}
          disabled={visiblePayableIds.length === 0}
          onChange={(checked) =>
            toggleSelectVisible(visiblePayableIds, checked)
          }
        />
      );
    },
    cell: ({ row }) => {
      const blocked = isRepayBlocked(row.original);

      return (
        <input
          type="checkbox"
          aria-label={`Select ${row.original.taskTitle}`}
          checked={selectedWorklogIds.includes(row.original.id)}
          disabled={blocked}
          title={blocked ? "Submitted worklogs cannot be repaid" : undefined}
          onChange={(event) =>
            toggleWorklogSelection(row.original.id, event.target.checked)
          }
        />
      );
    },
  },
  {
    accessorKey: "taskTitle",
    header: "Task",
    cell: ({ row }) => (
      <div className="min-w-[220px]">
        <div className="font-medium">{row.original.taskTitle}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.taskId}
        </div>
      </div>
    ),
  },
  {
    id: "freelancer",
    header: "Freelancer",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.freelancer.fullName}</div>
        <div className="text-sm text-muted-foreground">
          {row.original.freelancer.email}
        </div>
      </div>
    ),
  },
  {
    id: "period",
    header: "Period",
    cell: ({ row }) => (
      <div className="text-sm">
        {formatDate(row.original.periodStart)} -{" "}
        {formatDate(row.original.periodEnd)}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.status === "submitted" ? (
        <Badge className="border-green-600/60 bg-transparent text-green-700">
          Submitted
        </Badge>
      ) : (
        <Badge className="border-orange-600/60 bg-transparent text-orange-700">
          Draft
        </Badge>
      ),
  },
  {
    accessorKey: "totalEarnings",
    header: "Total earnings",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatMoney(row.original.totalEarnings)}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View more about ${row.original.taskTitle}`}
            onClick={() => onViewWorklog(row.original.id)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View more</p>
        </TooltipContent>
      </Tooltip>
    ),
  },
];
