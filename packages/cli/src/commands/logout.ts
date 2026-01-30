import { deleteCredentials } from "../utils/config";

export async function logout(): Promise<void> {
  await deleteCredentials();

  console.log("You have been successfully Logged out!");
}
