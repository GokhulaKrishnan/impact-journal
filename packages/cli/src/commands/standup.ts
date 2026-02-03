import { getStartOfDay, isWithinRange } from "@impact-journal/core";
import { loadData } from "../utils/config.js";
import clipboard from "clipboardy";

export async function standup(copy: boolean = false): Promise<void> {
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

  let resText = "";

  resText += "\nSTANDUP\n";
  resText += "Yesterday:\n";

  if (totalCommits > 0) {
    for (const commit of yesterdayCommits) {
      resText += `  - ${commit.message} (${commit.repo})\n`;
    }
  } else {
    resText += "  - No commits\n";
  }

  resText += "\nToday:\n";
  if (openPrs.length > 0) {
    for (const pr of openPrs) {
      resText += `  - Work on: ${pr.title}\n`;
    }
  } else {
    resText += "  - Continue current work\n";
  }

  resText += "\nBlockers:";
  resText += "\n  - None";

  console.log(resText);

  if (copy) {
    await clipboard.write(resText);
    console.log("Copied to clipboard!");
  }
}
