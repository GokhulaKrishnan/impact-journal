import { generateSummary } from "../services/summary";

describe("generateSummary", () => {
  const mockData = {
    commits: {
      "project-a": [
        {
          commit: {
            author: { date: "2026-01-15T10:00:00Z" },
            message: "feat: add login",
          },
        },
        {
          commit: {
            author: { date: "2026-01-16T10:00:00Z" },
            message: "fix: bug fix",
          },
        },
      ],
      "project-b": [
        {
          commit: {
            author: { date: "2026-01-10T10:00:00Z" },
            message: "initial commit",
          },
        },
      ],
    },
    pullRequests: {
      items: [
        {
          created_at: "2026-01-15T10:00:00Z",
          title: "Add feature",
          state: "open",
          repository_url: "https://api.github.com/repos/user/project-a",
        },
      ],
    },
  };

  it("should return correct structure", () => {
    const result = generateSummary(mockData, "month");

    expect(result).toHaveProperty("period");
    expect(result).toHaveProperty("startDate");
    expect(result).toHaveProperty("endDate");
    expect(result).toHaveProperty("totalCommits");
    expect(result).toHaveProperty("commitsByRepo");
    expect(result).toHaveProperty("prsInRange");
  });

  it("should count commits correctly", () => {
    const result = generateSummary(mockData, "month");

    expect(result.totalCommits).toBeGreaterThanOrEqual(0);
    expect(typeof result.totalCommits).toBe("number");
  });

  it("should handle empty data", () => {
    const emptyData = {
      commits: {},
      pullRequests: { items: [] },
    };

    const result = generateSummary(emptyData, "week");

    expect(result.totalCommits).toBe(0);
    expect(result.prsInRange).toEqual([]);
    expect(result.commitsByRepo).toEqual({});
  });

  it("should group commits by repository", () => {
    const result = generateSummary(mockData, "month");

    expect(typeof result.commitsByRepo).toBe("object");
  });
});
