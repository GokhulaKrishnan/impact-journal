import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import os from "os";
import { z } from "zod";
import { generateStandup, generateSummary } from "@impact-journal/core";
import path from "path";
import fs from "fs/promises";
import { handleFileRisk } from "./tools/file-risk.js";

const server = new McpServer({
  name: "impact-journal",
  version: "1.0.0",
});

async function loadData() {
  try {
    const filePath = path.join(os.homedir(), ".impact-journal", "data.json");
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

server.tool(
  "get_summary",
  "Get a summary of work done in a time period",
  {
    period: z
      .enum(["today", "week", "month"])
      .describe("Time period for the summary"),
  },
  async ({ period }) => {
    const data = await loadData();

    if (!data) {
      return {
        content: [
          { type: "text", text: "No data found. Run 'impact sync' first." },
        ],
      };
    }

    const summary = generateSummary(data, period);

    let result = `Summary for ${
      summary.period
    } (${summary.startDate.toDateString()} - ${summary.endDate.toDateString()})\n\n`;

    result += `Total commits: ${summary.totalCommits}\n`;

    if (summary.totalCommits > 0) {
      result += "\nBy repository:\n";
      for (const repo in summary.commitsByRepo) {
        result += `\n${repo}: ${summary.commitsByRepo[repo].length} commits\n`;
        for (const message of summary.commitsByRepo[repo]) {
          result += `  - ${message}\n`;
        }
      }
    }

    result += `\nPull requests: ${summary.prsInRange.length}`;
    if (summary.prsInRange.length > 0) {
      for (const pr of summary.prsInRange) {
        result += `\n  - ${pr.title} [${pr.state}] (${pr.repo})`;
      }
    }

    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "get_standup",
  "Generate a standup message with yesterday's work",
  {},
  async () => {
    const data = await loadData();

    if (!data) {
      return {
        content: [
          { type: "text", text: "No data found. Run 'impact sync' first." },
        ],
      };
    }

    const standup = generateStandup(data);

    let result = "STANDUP\n\n";
    result += "Yesterday:\n";

    if (standup.yesterdayCommits.length > 0) {
      for (const commit of standup.yesterdayCommits) {
        result += `  - ${commit.message} (${commit.repo})\n`;
      }
    } else {
      result += "  - No commits\n";
    }

    result += "\nToday:\n";
    if (standup.openPrs.length > 0) {
      for (const pr of standup.openPrs) {
        result += `  - Work on: ${pr.title}\n`;
      }
    } else {
      result += "  - Continue current work\n";
    }

    result += "\nBlockers:\n";
    result += "  - None";
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "analyze_file_risk",
  "Analyze the stability and risk level of a specific file based on Git history",
  {
    filename: z
      .string()
      .describe(
        "Path to the file to analyze (e.g., 'packages/core/src/services/github.ts')"
      ),
  },
  async ({ filename }) => {
    const result = await handleFileRisk(filename);

    return {
      content: [{ type: "text", text: result }],
    };
  }
);

main().catch(console.error);
