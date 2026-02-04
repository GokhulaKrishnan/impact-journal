import { generateStandup } from "@impact-journal/core";
import { loadData } from "../utils/config.js";
import clipboard from "clipboardy";

export async function standup(copy: boolean = false): Promise<void> {
  const githubData = await loadData();

  if (!githubData) {
    console.log("No data found. Run 'impact sync' first.");
    return;
  }

  const result = generateStandup(githubData);

  let resText = "";
  resText += "\nSTANDUP\n\n";
  resText += "Yesterday:\n";

  if (result.yesterdayCommits.length > 0) {
    for (const commit of result.yesterdayCommits) {
      resText += `  - ${commit.message} (${commit.repo})\n`;
    }
  } else {
    resText += "  - No commits\n";
  }

  resText += "\nToday:\n";
  if (result.openPrs.length > 0) {
    for (const pr of result.openPrs) {
      resText += `  - Work on: ${pr.title}\n`;
    }
  } else {
    resText += "  - Continue current work\n";
  }

  resText += "\nBlockers:\n";
  resText += "  - None";

  console.log(resText);

  if (copy) {
    await clipboard.write(resText);
    console.log("Copied to clipboard!");
  }
}
