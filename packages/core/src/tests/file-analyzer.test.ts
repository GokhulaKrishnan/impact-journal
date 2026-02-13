import {
  analyzeFile,
  isBugFixCommit,
  calculateRepoAverages,
} from "../services/file-analyzer";

describe("isBugFixCommit", () => {
  it("detects 'fix' keyword", () => {
    expect(isBugFixCommit("Fix connection timeout")).toBe(true);
  });

  it("detects 'hotfix' keyword", () => {
    expect(isBugFixCommit("Hotfix: memory leak in auth")).toBe(true);
  });

  it("detects lowercase 'fix' with prefix", () => {
    expect(isBugFixCommit("fix: null pointer exception")).toBe(true);
  });

  it("detects 'bug' keyword", () => {
    expect(isBugFixCommit("Bug fix for login issue")).toBe(true);
  });

  it("detects 'revert' keyword", () => {
    expect(isBugFixCommit("Revert previous commit")).toBe(true);
  });

  it("detects 'rollback' keyword", () => {
    expect(isBugFixCommit("Rollback broken deployment")).toBe(true);
  });

  it("detects 'patch' keyword", () => {
    expect(isBugFixCommit("Patch security vulnerability")).toBe(true);
  });

  it("detects 'issue' keyword", () => {
    expect(isBugFixCommit("Resolve issue with auth flow")).toBe(true);
  });

  it("returns false for feature additions", () => {
    expect(isBugFixCommit("Add new bluetooth feature")).toBe(false);
  });

  it("returns false for config updates", () => {
    expect(isBugFixCommit("Update configuration")).toBe(false);
  });

  it("returns false for refactors", () => {
    expect(isBugFixCommit("Refactor connection logic")).toBe(false);
  });

  it("returns false for performance improvements", () => {
    expect(isBugFixCommit("Improve performance")).toBe(false);
  });

  it("uses custom keywords when provided", () => {
    expect(isBugFixCommit("Resolve timeout error", ["resolve"])).toBe(true);
    expect(isBugFixCommit("Fix timeout error", ["resolve"])).toBe(false);
  });
});

describe("calculateRepoAverages", () => {
  it("returns zeros for empty commits", () => {
    const result = calculateRepoAverages([]);
    expect(result.avgCommitsPerFile).toBe(0);
    expect(result.avgBugFixPercentage).toBe(0);
  });

  it("skips commits without file info", () => {
    const commits = [
      { commit: { message: "Fix something" } },
      { commit: { message: "Add feature" }, files: [] },
    ];
    const result = calculateRepoAverages(commits);
    expect(result.avgCommitsPerFile).toBe(0);
  });

  it("calculates correct averages across files", () => {
    const commits = [
      {
        commit: { message: "Add feature" },
        files: [{ filename: "a.ts" }, { filename: "b.ts" }],
      },
      {
        commit: { message: "Fix bug in a" },
        files: [{ filename: "a.ts" }],
      },
    ];
    const result = calculateRepoAverages(commits);
    expect(result.avgCommitsPerFile).toBe(1.5);
    expect(result.avgBugFixPercentage).toBe(25);
  });
});

describe("analyzeFile", () => {
  function makeCommit(
    sha: string,
    message: string,
    date: string,
    files: string[]
  ) {
    return {
      sha,
      commit: { message, author: { date } },
      files: files.map((f) => ({ filename: f })),
    };
  }

  const now = new Date("2026-02-13T12:00:00Z");
  const recentDate = "2026-01-15T10:00:00Z";
  const recentDate2 = "2026-02-01T10:00:00Z";
  const baselineDate = "2025-10-15T10:00:00Z";
  const oldDate = "2025-01-15T10:00:00Z";
  const mockCommits = [
    makeCommit("1", "Add bluetooth feature", recentDate, [
      "bluetooth/connection.ts",
    ]),
    makeCommit("2", "Fix bluetooth timeout", "2026-01-20T10:00:00Z", [
      "bluetooth/connection.ts",
    ]),
    makeCommit("3", "Update bluetooth config", recentDate2, [
      "bluetooth/connection.ts",
      "config/bluetooth.ts",
    ]),
    makeCommit("4", "Fix bluetooth race condition", "2026-02-10T10:00:00Z", [
      "bluetooth/connection.ts",
    ]),
    makeCommit("5", "Improve bluetooth stability", baselineDate, [
      "bluetooth/connection.ts",
    ]),
    makeCommit(
      "6",
      "Initial bluetooth implementation",
      "2025-10-20T10:00:00Z",
      ["bluetooth/connection.ts"]
    ),
    makeCommit("7", "Very old commit", oldDate, ["bluetooth/connection.ts"]),
  ];

  it("counts total commits for a file", async () => {
    const result = await analyzeFile("bluetooth/connection.ts", mockCommits);
    expect(result.totalCommits).toBe(7);
  });

  it("counts recent commits within 90 days", async () => {
    const result = await analyzeFile("bluetooth/connection.ts", mockCommits);
    expect(result.recentCommits).toBe(4);
  });

  it("counts baseline commits (90-180 days ago)", async () => {
    const result = await analyzeFile("bluetooth/connection.ts", mockCommits);
    expect(result.baselineCommits).toBe(2);
  });

  it("detects bug fixes in recent commits", async () => {
    const result = await analyzeFile("bluetooth/connection.ts", mockCommits);
    expect(result.bugFixCount).toBe(2);
    expect(result.bugFixPercentage).toBe(50);
  });

  it("calculates trend direction", async () => {
    const result = await analyzeFile("bluetooth/connection.ts", mockCommits);
    expect(result.trendDirection).toBe("increasing");
    expect(result.trendPercentage).toBe(100);
  });

  it("returns UNKNOWN risk when no recent commits", async () => {
    const oldOnlyCommits = [
      makeCommit("1", "Old work", oldDate, ["old-file.ts"]),
    ];
    const result = await analyzeFile("old-file.ts", oldOnlyCommits);
    expect(result.riskLevel).toBe("UNKNOWN");
    expect(result.riskReasons).toContain("No recent activity in last 90 days");
  });

  it("returns LOW risk for normal activity", async () => {
    const normalCommits = [
      makeCommit("1", "Add feature", recentDate, ["normal.ts", "other.ts"]),
      makeCommit("2", "Update docs", recentDate2, ["normal.ts", "other.ts"]),
    ];
    const result = await analyzeFile("normal.ts", normalCommits);
    expect(result.riskLevel).toBe("LOW");
  });

  it("returns correct filename in result", async () => {
    const result = await analyzeFile("bluetooth/connection.ts", mockCommits);
    expect(result.filename).toBe("bluetooth/connection.ts");
  });

  it("returns zero commits for file not in any commit", async () => {
    const result = await analyzeFile("nonexistent.ts", mockCommits);
    expect(result.totalCommits).toBe(0);
    expect(result.recentCommits).toBe(0);
  });

  it("handles commits without files array", async () => {
    const noFileCommits = [
      {
        sha: "1",
        commit: { message: "No files", author: { date: recentDate } },
      },
    ];
    const result = await analyzeFile("any-file.ts", noFileCommits as any);
    expect(result.totalCommits).toBe(0);
  });
});
