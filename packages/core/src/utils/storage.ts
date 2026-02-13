import os from "os";
import path from "path";
import fs from "fs/promises";

export function getConfigDir(): string {
  return path.join(os.homedir(), ".impact-journal");
}

export function getDataPath(): string {
  return path.join(getConfigDir(), "data.json");
}

export async function loadData(): Promise<any | null> {
  try {
    const content = await fs.readFile(getDataPath(), "utf-8");

    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

export async function saveData(data: object): Promise<void> {
  await fs.mkdir(getConfigDir(), { recursive: true });

  await fs.writeFile(getDataPath(), JSON.stringify(data, null, 2));
}

export function getAllCommits(data: any): any[] {
  if (!data || !data.commits) return [];

  let allCommits: any[] = [];

  for (const repo in data.commits) {
    allCommits = allCommits.concat(data.commits[repo]);
  }
  return allCommits;
}
