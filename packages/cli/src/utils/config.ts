import os from "os";
import path from "path";
import fs from "fs/promises";

export function getConfigDir(): string {
  const homeDirectory = os.homedir();
  const pathName = path.join(homeDirectory, ".impact-journal");
  return pathName;
}

function getCredentialsPath(): string {
  return path.join(getConfigDir(), "credentials.json");
}

export async function saveCredentials(token: string): Promise<void> {
  await fs.mkdir(getConfigDir(), { recursive: true });

  await fs.writeFile(
    getCredentialsPath(),
    JSON.stringify({ access_token: token })
  );
}

export async function loadCredentials(): Promise<string | null> {
  try {
    const token = await fs.readFile(getCredentialsPath(), "utf-8");
    const data = JSON.parse(token);
    return data.access_token;
  } catch (error) {
    return null;
  }
}

export async function deleteCredentials(): Promise<void> {
  try {
    await fs.unlink(getCredentialsPath());
  } catch (error) {}
}
