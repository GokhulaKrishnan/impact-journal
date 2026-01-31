import {
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek,
  isWithinRange,
} from "@impact-journal/core";
import { loadData } from "../utils/config";

export async function summary(period: string = "week"): Promise<void> {
  const githubData = await loadData();

  if (!githubData) {
    console.log("No data found. Run 'impact sync' first.");
    return;
  }

  const today = new Date();
  let start: Date;
  if (period === "week") {
    const startOfTheWeek = getStartOfWeek(today);
    start = startOfTheWeek;
  } else if (period === "today") {
    const startOfDay = getStartOfDay(today);
    start = startOfDay;
  } else {
    const startOfMonth = getStartOfMonth(today);
    start = startOfMonth;
  }

  console.log(
    `The date range is ${start.toDateString()} - ${today.toDateString()}`
  );

  let totalCommits = 0;
  const commitsByRepo: { [repo: string]: number } = {};

  for (const repoName in githubData.commits) {
    const commits = githubData.commits[repoName];
    let repoCount = 0;

    for (const commit of commits) {
      if (isWithinRange(new Date(commit.commit.author.date), start, today)) {
        repoCount++;
      }
    }

    if (repoCount > 0) {
      commitsByRepo[repoName] = repoCount;
      totalCommits += repoCount;
    }
  }

  console.log(`\nTotal commits: ${totalCommits}`);

  if (totalCommits > 0) {
    console.log("\nBy repository:");
    for (const repo in commitsByRepo) {
      console.log(`${repo}: ${commitsByRepo[repo]} commits`);
    }
  }

  let prCount = 0;
  for (const pr of githubData.pullRequests.items) {
    if (isWithinRange(new Date(pr.created_at), start, today)) {
      prCount += 1;
    }
  }

  console.log(`\nPull requests: ${prCount}`);
}
