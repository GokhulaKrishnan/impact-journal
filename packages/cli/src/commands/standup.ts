import { getStartOfDay, isWithinRange } from "@impact-journal/core";
import { loadData } from "../utils/config";

export async function standup(): Promise<void> {
  const githubData = await loadData();

  if (!githubData) {
    console.log("No data found. Run 'impact sync' first.");
    return;
  }

  const openPrs = githubData.pullRequests.items.filter(
    (pr: { state: string }) => pr.state == "open"
  );

  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  const yesterdayStart = getStartOfDay(yesterday);
  const yesterdayEnd = getStartOfDay(today);

  const yesterdayCommits: { repo: string; message: string }[] = [];
  let totalCommits = 0;
  for (const repoName in githubData.commits) {
    const commits = githubData.commits[repoName];

    for (const commit of commits) {
      if (
        isWithinRange(
          new Date(commit.commit.author.date),
          yesterdayStart,
          yesterdayEnd
        )
      ) {
        yesterdayCommits.push({
          repo: repoName,
          message: commit.commit.message,
        });
        totalCommits += 1;
      }
    }
  }

  console.log("\nSTANDUP\n");
  console.log("Yesterday:");

  if (totalCommits > 0) {
    for (const commit of yesterdayCommits) {
      console.log(`  - ${commit.message} (${commit.repo})`);
    }
  } else {
    console.log("  - No commits");
  }

  console.log("\nToday:");
  if (openPrs.length > 0) {
    for (const pr of openPrs) {
      console.log(`  - Work on: ${pr.title}`);
    }
  } else {
    console.log("  - Continue current work");
  }

  console.log("\nBlockers:");
  console.log("  - None");
}
