import { analyzeFile, getAllCommits, loadData } from "@impact-journal/core";
import chalk from "chalk";

export async function fileRisk(filename: string): Promise<void> {
  console.log(chalk.blue(`\nAnalyzing file: ${filename}\n`));
  const data = await loadData();

  if (!data || !data.commits) {
    console.log(
      chalk.red('No data found. Run "impact sync" first to sync recent data.')
    );
    return;
  }

  const allCommits = getAllCommits(data);

  if (allCommits.length === 0) {
    console.log(chalk.red("No commits found in synced data."));
    return;
  }

  const analysis = await analyzeFile(filename, allCommits);
  displayFileRiskAnalysis(analysis);
}

function displayFileRiskAnalysis(analysis: any): void {
  console.log(chalk.bold("=".repeat(60)));
  console.log(chalk.bold.cyan("FILE RISK ANALYSIS"));
  console.log(chalk.bold("=".repeat(60)));
  console.log("");

  console.log(chalk.bold("File:"), analysis.filename);
  console.log("");

  console.log(
    chalk.bold("Activity (last 90 days):"),
    `${analysis.recentCommits} commits`
  );
  console.log("Repository average:", `${analysis.repoAvgCommits} commits`);

  if (analysis.activityMultiplier > 1) {
    console.log(
      chalk.yellow(`This file: ${analysis.activityMultiplier}x above average `)
    );
  } else {
    console.log(
      chalk.green(`This file: ${analysis.activityMultiplier}x average`)
    );
  }
  console.log("");

  console.log(
    chalk.bold("Bug fixes:"),
    `${analysis.bugFixCount}/${analysis.recentCommits} commits (${analysis.bugFixPercentage}%)`
  );
  console.log("Repository average:", `${analysis.repoAvgBugFixPercentage}%`);

  if (analysis.bugFixPercentage > analysis.repoAvgBugFixPercentage * 2) {
    console.log(
      chalk.yellow(
        `This file: ${
          Math.round(
            (analysis.bugFixPercentage / analysis.repoAvgBugFixPercentage) * 10
          ) / 10
        }x above average`
      )
    );
  } else {
    console.log(chalk.green(`This file: Within normal range`));
  }
  console.log("");

  console.log(chalk.bold("Stability trend:"));
  console.log("Baseline period:", `${analysis.baselineCommits} commits`);
  console.log("Recent period:", `${analysis.recentCommits} commits`);

  if (analysis.trendDirection === "increasing") {
    console.log(
      chalk.yellow(`Trend: ↑ Increasing (${analysis.trendPercentage}%) ⚠️`)
    );
  } else if (analysis.trendDirection === "decreasing") {
    console.log(
      chalk.green(`Trend: ↓ Decreasing (${analysis.trendPercentage}%) ✓`)
    );
  } else {
    console.log(chalk.blue(`Trend: → Stable`));
  }
  console.log("");

  console.log(chalk.bold("=".repeat(60)));
  console.log("");

  const riskColor =
    analysis.riskLevel === "HIGH"
      ? chalk.red
      : analysis.riskLevel === "MEDIUM"
      ? chalk.yellow
      : analysis.riskLevel === "LOW"
      ? chalk.green
      : chalk.gray;

  const riskIcon =
    analysis.riskLevel === "HIGH"
      ? "🔴"
      : analysis.riskLevel === "MEDIUM"
      ? "🟡"
      : analysis.riskLevel === "LOW"
      ? "✅"
      : "❓";

  console.log(riskIcon, riskColor.bold(`RISK LEVEL: ${analysis.riskLevel}`));
  console.log("");

  if (analysis.riskReasons.length > 0) {
    console.log(chalk.bold("Reasons:"));
    for (const reason of analysis.riskReasons) {
      console.log(`• ${reason}`);
    }
  }

  console.log("");
  console.log(chalk.bold("=".repeat(60)));
  console.log("");
}
