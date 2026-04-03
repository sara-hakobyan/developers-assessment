export type WorklogStatus = "submitted" | "draft";
export type PaymentStatus = "paid" | "draft";

export type Freelancer = {
  id: string;
  fullName: string;
  email: string;
  hourlyRate: number;
};

export type Worklog = {
  id: string;
  taskId: string;
  taskTitle: string;
  freelancerId: string;
  status: WorklogStatus;
  submittedAt: string | null;
  periodStart: string;
  periodEnd: string;
  totalEarnings: number;
};

export type TimeEntry = {
  id: string;
  worklogId: string;
  date: string;
  hours: number;
  hourlyRate: number;
  amount: number;
  description: string;
};

export type PaymentSummary = {
  id: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  currency: string;
  includedWorklogIds: string[];
  excludedWorklogIds: string[];
  excludedFreelancerIds: string[];
  status: PaymentStatus;
  confirmedAt: string | null;
  notes: string;
};

//ui types
export type WorklogWithFreelancer = Worklog & {
  freelancer: Freelancer;
};

export type WorklogFiltersValue = {
  fromDate: string;
  toDate: string;
  statusFilter: "all" | "submitted" | "draft";
};

export type WorklogFiltersActions = {
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onStatusFilterChange: (value: "all" | "submitted" | "draft") => void;
  onSearch: () => void;
  onClear: () => void;
  onReviewSelected: () => void;
};
