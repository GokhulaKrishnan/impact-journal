import {
  getAuthenticatedUser,
  getRepoCommitsWithFiles,
  getUserPullRequests,
  getUserRepos,
  saveData,
} from "@impact-journal/core";
import { loadCredentials } from "../utils/config.js";

export async function sync(): Promise<void> {
  const credential = await loadCredentials();

  if (!credential) {
    console.log("Not logged in. Run 'impact login' first.");
    return;
  }

  console.log("Syncing your GitHub activity...\n");

  const user = await getAuthenticatedUser(credential);

  console.log(`Fetching data for @${user.login}...`);

  const repos = await getUserRepos(credential);

  console.log(`Found ${repos.length} repositories`);

  const commitsByRepo: { [repoName: string]: any[] } = {};

  for (const repo of repos) {
    const commits = await getRepoCommitsWithFiles(
      credential,
      repo.owner.login,
      repo.name,
      user.login,
      undefined,
      100
    );

    if (Array.isArray(commits)) {
      console.log(`${repo.name}: ${commits.length} commits`);
      commitsByRepo[repo.name] = commits;
    }
  }

  const totalCommits = Object.values(commitsByRepo).reduce(
    (sum, commits) => (sum += commits.length),
    0
  );
  console.log(`\nTotal: ${totalCommits} commits`);

  const prs = await getUserPullRequests(credential, user.login);
  console.log(`Found ${prs.total_count} pull requests`);

  await saveData({
    lastSync: new Date().toISOString(),
    user: user,
    repos: repos,
    commits: commitsByRepo,
    pullRequests: prs,
  });

  console.log("\nSync Completed!");
}
