import { analyzeFile } from "@impact-journal/core";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { loadData } from "@impact-journal/core";

export async function handleFileRisk(filename: string): Promise<string> {
  const data = await loadData();

  if (!data || !data.commits) {
    return 'No GitHub data found. Run "impact sync" first.';
  }

  let allCommits: any[] = [];
  for (const repo in data.commits) {
    allCommits = allCommits.concat(data.commits[repo]);
  }

  if (allCommits.length === 0) {
    return "No commits found in synced data.";
  }

  const analysis = await analyzeFile(filename, allCommits);

  const riskEmoji =
    analysis.riskLevel === "HIGH"
      ? "🔴"
      : analysis.riskLevel === "MEDIUM"
      ? "🟡"
      : analysis.riskLevel === "LOW"
      ? "✅"
      : "❓";

  let response = `${riskEmoji} File Risk Analysis: ${filename}\n\n`;

  response += `Risk Level: ${analysis.riskLevel}\n\n`;

  response += `Activity Metrics:\n`;
  response += `- Recent commits (90 days): ${analysis.recentCommits}\n`;
  response += `- Repository average: ${analysis.repoAvgCommits} commits\n`;
  response += `- This file: ${analysis.activityMultiplier}x average\n\n`;

  response += `Bug Fix Metrics:\n`;
  response += `- Bug fixes: ${analysis.bugFixCount}/${analysis.recentCommits} (${analysis.bugFixPercentage}%)\n`;
  response += `- Repository average: ${analysis.repoAvgBugFixPercentage}%\n\n`;

  response += `Stability Trend:\n`;
  response += `- Baseline commits: ${analysis.baselineCommits}\n`;
  response += `- Recent commits: ${analysis.recentCommits}\n`;
  response += `- Trend: ${analysis.trendDirection} (${analysis.trendPercentage}%)\n\n`;

  if (analysis.riskReasons.length > 0) {
    response += `Risk Factors:\n`;
    for (const reason of analysis.riskReasons) {
      response += `- ${reason}\n`;
    }
  }

  return response;
}
