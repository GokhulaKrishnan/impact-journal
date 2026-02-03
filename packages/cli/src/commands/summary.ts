import {
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek,
  isWithinRange,
} from "@impact-journal/core";
import { loadData } from "../utils/config.js";
import dotenv from "dotenv";
import path from "path";
import { createAiSummary } from "@impact-journal/core";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export async function summary(
  period: string = "week",
  useAi: boolean = false
): Promise<void> {
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
  const commitsByRepo: { [repo: string]: string[] } = {};

  for (const repoName in githubData.commits) {
    const commits = githubData.commits[repoName];
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

  console.log(`\nTotal commits: ${totalCommits}`);

  if (totalCommits > 0) {
    console.log("\nBy repository:");
    for (const repo in commitsByRepo) {
      console.log(`\n  ${repo}: ${commitsByRepo[repo].length} commits`);
      for (const message of commitsByRepo[repo]) {
        console.log(`    - ${message}`);
      }
    }
  }

  const prsInRange: { title: string; repo: string; state: string }[] = [];

  for (const pr of githubData.pullRequests.items) {
    if (isWithinRange(new Date(pr.created_at), start, today)) {
      prsInRange.push({
        title: pr.title,
        repo: pr.repository_url.split("/").pop(),
        state: pr.state,
      });
    }
  }

  console.log(`\nPull requests: ${prsInRange.length}`);
  if (prsInRange.length > 0) {
    for (const pr of prsInRange) {
      console.log(`  - ${pr.title} [${pr.state}] (${pr.repo})`);
    }
  }

  if (useAi) {
    if (totalCommits === 0) {
      console.log("\nNo commits to summarize.");
    } else {
      console.log("\n--- AI Summary ---\n");
      const allCommits: string[] = [];
      for (const repo in commitsByRepo) {
        for (const message of commitsByRepo[repo]) {
          allCommits.push(` ${message} (${repo})`);
        }
      }

      const aiSummary = await createAiSummary(
        allCommits,
        process.env.GROQ_API_KEY || ""
      );
      console.log(aiSummary);
    }
  }
}
