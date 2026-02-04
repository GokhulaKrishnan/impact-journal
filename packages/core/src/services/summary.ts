import {
  getStartOfDay,
  getStartOfWeek,
  getStartOfMonth,
} from "../utils/dates.js";
import { isWithinRange } from "../utils/dates.js";

export interface SummaryResult {
  period: string;
  startDate: Date;
  endDate: Date;
  totalCommits: number;
  commitsByRepo: { [repo: string]: string[] };
  prsInRange: { title: string; repo: string; state: string }[];
}

export function generateSummary(data: any, period: string): SummaryResult {
  const today = new Date();
  let start: Date;

  if (period === "today") {
    start = getStartOfDay(today);
  } else if (period === "week") {
    start = getStartOfWeek(today);
  } else {
    start = getStartOfMonth(today);
  }

  // Filter commits
  let totalCommits = 0;
  const commitsByRepo: { [repo: string]: string[] } = {};

  for (const repoName in data.commits) {
    const commits = data.commits[repoName];
    const repoMessages: string[] = [];

    for (const commit of commits) {
      if (isWithinRange(new Date(commit.commit.author.date), start, today)) {
        repoMessages.push(commit.commit.message);
      }
    }

    if (repoMessages.length > 0) {
      commitsByRepo[repoName] = repoMessages;
      totalCommits += repoMessages.length;
    }
  }

  const prsInRange: { title: string; repo: string; state: string }[] = [];
  for (const pr of data.pullRequests.items) {
    if (isWithinRange(new Date(pr.created_at), start, today)) {
      prsInRange.push({
        title: pr.title,
        repo: pr.repository_url.split("/").pop() || "",
        state: pr.state,
      });
    }
  }

  return {
    period,
    startDate: start,
    endDate: today,
    totalCommits,
    commitsByRepo,
    prsInRange,
  };
}
