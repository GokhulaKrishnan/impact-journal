export interface FileAnalysis {
  filename: string;
  totalCommits: number;
  recentCommits: number;
  repoAvgCommits: number;
  activityMultiplier: number;
  bugFixCount: number;
  bugFixPercentage: number;
  repoAvgBugFixPercentage: number;
  baselineCommits: number;
  trendDirection: "increasing" | "decreasing" | "stable";
  trendPercentage: number;

  riskLevel: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  riskReasons: string[];
  analyzedAt: Date;
}

export interface FileAnalysisConfig {
  recentDays: number;
  baselineDays: number;
  bugFixKeywords: string[];
}

const DEFAULT_CONFIG: FileAnalysisConfig = {
  recentDays: 90,
  baselineDays: 90,
  bugFixKeywords: [
    "fix",
    "bug",
    "bugfix",
    "hotfix",
    "patch",
    "issue",
    "revert",
    "rollback",
  ],
};

export async function analyzeFile(
  filename: string,
  commits: any[],
  config: Partial<FileAnalysisConfig> = {}
): Promise<FileAnalysis> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const now = new Date();
  const recentCutoff = new Date(
    now.getTime() - cfg.recentDays * 24 * 60 * 60 * 1000
  );
  const baselineStart = new Date(
    now.getTime() - (cfg.recentDays + cfg.baselineDays) * 24 * 60 * 60 * 1000
  );
  const baselineEnd = recentCutoff;

  const fileCommits = commits.filter((commit) =>
    commitTouchesFile(commit, filename)
  );
  const totalCommits = fileCommits.length;

  const recentCommits = fileCommits.filter((commit) => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate >= recentCutoff;
  }).length;

  const baselineCommits = fileCommits.filter((commit) => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate >= baselineStart && commitDate < baselineEnd;
  }).length;

  let trendDirection: "increasing" | "decreasing" | "stable" = "stable";
  let trendPercentage = 0;

  if (baselineCommits > 0) {
    trendPercentage = Math.round(
      ((recentCommits - baselineCommits) / baselineCommits) * 100
    );

    if (trendPercentage >= 50) {
      trendDirection = "increasing";
    } else if (trendPercentage < -50) {
      trendDirection = "decreasing";
    }
  } else if (recentCommits > 0) {
    trendDirection = "increasing";
    trendPercentage = 100;
  }

  const recentFileCommits = fileCommits.filter((commit) => {
    const commitDate = new Date(commit.commit.author.date);
    return commitDate >= recentCutoff;
  });

  const bugFixCount = recentFileCommits.filter((commit) =>
    isBugFixCommit(commit.commit.message, cfg.bugFixKeywords)
  ).length;

  const bugFixPercentage =
    recentCommits > 0 ? Math.round((bugFixCount / recentCommits) * 100) : 0;

  const repoAverages = calculateRepoAverages(commits);
  const repoAvgCommits = repoAverages.avgCommitsPerFile;
  const repoAvgBugFixPercentage = repoAverages.avgBugFixPercentage;

  const activityMultiplier =
    repoAvgCommits > 0
      ? Math.round((recentCommits / repoAvgCommits) * 10) / 10
      : 0;

  let riskLevel: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN" = "LOW";
  const riskReasons: string[] = [];

  if (recentCommits === 0) {
    riskLevel = "UNKNOWN";
    riskReasons.push("No recent activity in last 90 days");
  } else {
    // HIGH RISK
    if (
      activityMultiplier >= 3 &&
      bugFixPercentage >= 50 &&
      trendDirection === "increasing"
    ) {
      riskLevel = "HIGH";
      riskReasons.push(`Activity ${activityMultiplier}x above average`);
      riskReasons.push(`${bugFixPercentage}% of commits are bug fixes`);
      riskReasons.push(`Activity increased ${trendPercentage}%`);
    }
    // MEDIUM-HIGH RISK
    else if (activityMultiplier >= 2.5 && bugFixPercentage >= 40) {
      riskLevel = "HIGH";
      riskReasons.push(`Activity ${activityMultiplier}x above average`);
      riskReasons.push(
        `${bugFixPercentage}% of commits are bug fixes (repo avg: ${repoAvgBugFixPercentage}%)`
      );
    }
    // MEDIUM RISK
    else if (activityMultiplier >= 2 || bugFixPercentage >= 30) {
      riskLevel = "MEDIUM";

      if (activityMultiplier >= 2) {
        riskReasons.push(`Activity ${activityMultiplier}x above average`);
      }
      if (bugFixPercentage >= 30) {
        riskReasons.push(`${bugFixPercentage}% of commits are bug fixes`);
      }
      if (trendDirection === "increasing") {
        riskReasons.push(`Activity is increasing (${trendPercentage}%)`);
      }
    }
    // LOW RISK (default)
    else {
      riskLevel = "LOW";
      riskReasons.push("Activity and bug fix rates are normal");
    }
  }

  return {
    filename,
    totalCommits,
    recentCommits,
    repoAvgCommits,
    activityMultiplier,
    bugFixCount,
    bugFixPercentage,
    repoAvgBugFixPercentage,
    baselineCommits,
    trendDirection,
    trendPercentage,
    riskLevel,
    riskReasons,
    analyzedAt: new Date(),
  };
}

function commitTouchesFile(commit: any, filename: string): boolean {
  if (!commit.files) {
    return false;
  }

  return commit.files.some((file: any) => file.filename === filename);
}

export function isBugFixCommit(
  message: string,
  keywords: string[] = DEFAULT_CONFIG.bugFixKeywords
): boolean {
  const lowerMessage = message.toLowerCase();

  return keywords.some((keyword) =>
    lowerMessage.includes(keyword.toLowerCase())
  );
}

export function calculateRepoAverages(commits: any[]): {
  avgCommitsPerFile: number;
  avgBugFixPercentage: number;
} {
  if (commits.length === 0) {
    return {
      avgCommitsPerFile: 0,
      avgBugFixPercentage: 0,
    };
  }

  const fileCommitCounts = new Map<string, number>();
  const fileBugFixCounts = new Map<string, number>();

  for (const commit of commits) {
    if (!commit.files || commit.files.length === 0) {
      continue;
    }

    const isBugFix = isBugFixCommit(commit.commit.message);

    for (const file of commit.files) {
      const filename = file.filename;

      fileCommitCounts.set(filename, (fileCommitCounts.get(filename) || 0) + 1);

      if (isBugFix) {
        fileBugFixCounts.set(
          filename,
          (fileBugFixCounts.get(filename) || 0) + 1
        );
      }
    }
  }

  const totalFiles = fileCommitCounts.size;
  const totalCommitCounts = Array.from(fileCommitCounts.values()).reduce(
    (sum, count) => sum + count,
    0
  );
  const avgCommitsPerFile = totalFiles > 0 ? totalCommitCounts / totalFiles : 0;

  let totalBugFixPercentages = 0;
  let filesWithCommits = 0;

  for (const [filename, commitCount] of fileCommitCounts) {
    const bugFixCount = fileBugFixCounts.get(filename) || 0;
    const bugFixPercentage = (bugFixCount / commitCount) * 100;
    totalBugFixPercentages += bugFixPercentage;
    filesWithCommits++;
  }

  const avgBugFixPercentage =
    filesWithCommits > 0 ? totalBugFixPercentages / filesWithCommits : 0;

  return {
    avgCommitsPerFile: Math.round(avgCommitsPerFile * 10) / 10,
    avgBugFixPercentage: Math.round(avgBugFixPercentage * 10) / 10,
  };
}
