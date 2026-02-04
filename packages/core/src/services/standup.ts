import { getStartOfDay } from "../utils/dates.js";
import { isWithinRange } from "../utils/dates.js";

export interface StandupResult {
  yesterdayCommits: { repo: string; message: string }[];
  openPrs: { title: string }[];
}

export function generateStandup(data: any): StandupResult {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStart = getStartOfDay(yesterday);
  const yesterdayEnd = getStartOfDay(today);

  const yesterdayCommits: { repo: string; message: string }[] = [];

  for (const repoName in data.commits) {
    const commits = data.commits[repoName];
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
      }
    }
  }

  const openPrs = data.pullRequests.items
    .filter((pr: { state: string }) => pr.state === "open")
    .map((pr: { title: string }) => ({ title: pr.title }));

  return {
    yesterdayCommits,
    openPrs,
  };
}
