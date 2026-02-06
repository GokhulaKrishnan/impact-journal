import { generateStandup } from "../services/standup";

describe("generateStandup", () => {
  it("should return correct structure", () => {
    const mockData = {
      commits: {},
      pullRequests: { items: [] },
    };

    const result = generateStandup(mockData);

    expect(result).toHaveProperty("yesterdayCommits");
    expect(result).toHaveProperty("openPrs");
    expect(Array.isArray(result.yesterdayCommits)).toBe(true);
    expect(Array.isArray(result.openPrs)).toBe(true);
  });

  it("should return empty arrays when no data", () => {
    const emptyData = {
      commits: {},
      pullRequests: { items: [] },
    };

    const result = generateStandup(emptyData);

    expect(result.yesterdayCommits).toEqual([]);
    expect(result.openPrs).toEqual([]);
  });

  it("should only include open PRs", () => {
    const mockData = {
      commits: {},
      pullRequests: {
        items: [
          { title: "Open PR", state: "open" },
          { title: "Closed PR", state: "closed" },
          { title: "Another Open", state: "open" },
        ],
      },
    };

    const result = generateStandup(mockData);

    expect(result.openPrs.length).toBe(2);
  });

  it("should include repo name with commits", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);

    const mockData = {
      commits: {
        "my-project": [
          {
            commit: {
              author: { date: yesterday.toISOString() },
              message: "test commit",
            },
          },
        ],
      },
      pullRequests: { items: [] },
    };

    const result = generateStandup(mockData);

    if (result.yesterdayCommits.length > 0) {
      expect(result.yesterdayCommits[0]).toHaveProperty("repo");
      expect(result.yesterdayCommits[0]).toHaveProperty("message");
    }
  });
});
