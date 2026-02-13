import { generateSummary, createAiSummary } from "@impact-journal/core";
import { loadData } from "@impact-journal/core";
import dotenv from "dotenv";
import path from "path";
import clipboard from "clipboardy";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export async function summary(
  period: string = "week",
  useAi: boolean = false,
  copy: boolean = false
): Promise<void> {
  const githubData = await loadData();

  if (!githubData) {
    console.log("No data found. Run 'impact sync' first.");
    return;
  }

  const result = generateSummary(githubData, period);

  console.log(
    `The date range is ${result.startDate.toDateString()} - ${result.endDate.toDateString()}`
  );

  let resText = "";
  resText += `\nTotal commits: ${result.totalCommits}\n`;

  if (result.totalCommits > 0) {
    resText += "\nBy repository:\n";
    for (const repo in result.commitsByRepo) {
      resText += `\n   ${repo}: ${result.commitsByRepo[repo].length} commits\n`;
      for (const message of result.commitsByRepo[repo]) {
        resText += `    - ${message}\n`;
      }
    }
  }

  resText += `\nPull requests: ${result.prsInRange.length}`;
  if (result.prsInRange.length > 0) {
    for (const pr of result.prsInRange) {
      resText += `  - ${pr.title} [${pr.state}] (${pr.repo})\n`;
    }
  }

  console.log(resText);

  if (copy) {
    await clipboard.write(resText);
    console.log("Copied to clipboard!");
  }

  if (useAi) {
    if (result.totalCommits === 0) {
      console.log("\nNo commits to summarize.");
    } else {
      console.log("\n--- AI Summary ---\n");
      const allCommits: string[] = [];
      for (const repo in result.commitsByRepo) {
        for (const message of result.commitsByRepo[repo]) {
          allCommits.push(`- ${message} (${repo})`);
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
