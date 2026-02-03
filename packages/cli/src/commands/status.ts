import { getAuthenticatedUser } from "@impact-journal/core";
import { loadCredentials } from "../utils/config.js";

export async function status(): Promise<void> {
  const credential = await loadCredentials();

  if (!credential) {
    console.log("\n Not logged in");
    return;
  }

  const user = await getAuthenticatedUser(credential);

  console.log(`Logged in as ${user.login}`);
}
