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
  fromTime?: string
) {
  let url = `https://api.github.com/repos/${owner}/${repo}/commits`;

  const params: string[] = [];
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
