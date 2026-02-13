function handleApiError(response: Response): never {
  if (response.status === 401) {
    throw new Error(
      "Invalid or expired token. Please run 'impact login' again."
    );
  } else if (response.status === 403) {
    throw new Error("Rate limited by GitHub. Please wait a few minutes.");
  } else {
    throw new Error(`GitHub API error: ${response.status}`);
  }
}

export async function getAuthenticatedUser(token: string) {
  const response = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    handleApiError(response);
  }
  const data = await response.json();
  return data;
}

export async function getUserRepos(token: string) {
  const response = await fetch(
    "https://api.github.com/user/repos?sort=pushed&per_page=10",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    handleApiError(response);
  }

  const data = await response.json();
  return data;
}

export async function getRepoCommits(
  token: string,
  owner: string,
  repo: string,
  author?: string,
  fromTime?: string,
  perPage: number = 100
) {
  let url = `https://api.github.com/repos/${owner}/${repo}/commits`;
  const params: string[] = [];

  params.push(`per_page=${perPage}`);

  if (author) {
    params.push(`author=${author}`);
  }
  if (fromTime) {
    params.push(`since=${fromTime}`);
  }

  if (params.length > 0) {
    url += "?" + params.join("&");
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    handleApiError(response);
  }

  const data = await response.json();
  return data;
}

export async function getUserPullRequests(token: string, username: string) {
  const response = await fetch(
    `https://api.github.com/search/issues?q=author:${username}+type:pr`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    handleApiError(response);
  }

  const data = await response.json();
  return data;
}

export async function getCommitDetails(
  token: string,
  owner: string,
  repo: string,
  sha: string
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    handleApiError(response);
  }

  const data = await response.json();
  return data;
}

export async function getRepoCommitsWithFiles(
  token: string,
  owner: string,
  repo: string,
  author?: string,
  fromTime?: string,
  maxCommits: number = 100
) {
  const commitList = await getRepoCommits(
    token,
    owner,
    repo,
    author,
    fromTime,
    maxCommits
  );

  console.log(`Fetching details for ${commitList.length} commits...`);

  const commitsWithFiles = [];

  for (let i = 0; i < commitList.length; i++) {
    const commit = commitList[i];

    // Showing progress every 10 commits
    if ((i + 1) % 10 === 0) {
      console.log(`  Progress: ${i + 1}/${commitList.length} commits...`);
    }

    try {
      const detailedCommit = await getCommitDetails(
        token,
        owner,
        repo,
        commit.sha
      );
      commitsWithFiles.push(detailedCommit);

      // Adding a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to fetch commit ${commit.sha}: ${error}`);
      commitsWithFiles.push(commit);
    }
  }

  console.log(`Fetched ${commitsWithFiles.length} commits with file details\n`);

  return commitsWithFiles;
}
