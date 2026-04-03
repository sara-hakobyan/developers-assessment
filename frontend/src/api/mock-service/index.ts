import freelancers from "@/mocks/freelancers.json";
import worklogs from "@/mocks/worklogs.json";
import timeEntries from "@/mocks/time-entries.json";
import { Freelancer, TimeEntry, Worklog } from "@/types";

const delay = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));

const freelancerStore: Freelancer[] = structuredClone(freelancers);
const worklogStore: Worklog[] = structuredClone(worklogs) as Worklog[];
const timeEntryStore: TimeEntry[] = structuredClone(timeEntries);

export async function getFreelancers(): Promise<Freelancer[]> {
  await delay();
  return structuredClone(freelancerStore);
}

export async function getWorklogs(): Promise<Worklog[]> {
  await delay();
  return structuredClone(worklogStore);
}

export async function getTimeEntries(): Promise<TimeEntry[]> {
  await delay();
  return structuredClone(timeEntryStore);
}

export async function confirmWorklogPayments(
  worklogIds: string[]
): Promise<Worklog[]> {
  await delay();
  const worklogIdSet = new Set(worklogIds);

  for (const worklog of worklogStore) {
    if (worklogIdSet.has(worklog.id) && worklog.status === "draft") {
      worklog.status = "submitted";
      worklog.submittedAt = new Date().toISOString();
    }
  }

  return structuredClone(worklogStore);
}
