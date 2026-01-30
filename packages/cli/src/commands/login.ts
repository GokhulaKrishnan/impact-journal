import { requestDeviceCode, pollAccessToken } from "@impact-journal/core";
import { saveCredentials } from "../utils/config.js";

const CLIENT_ID = "Ov23liyGqhK00xrsPkkQ";

export async function login(): Promise<void> {
  // Request git hub code from the url
  const response = await requestDeviceCode(CLIENT_ID);
  // show the code for the user
  console.log("\nTo authenticate, visit:", response.verification_uri);

  console.log("And enter the code:", response.user_code);
  // Poll to check whether it is authorized

  try {
    console.log("\nWaiting for authorization...\n");
    const tokenResponse = await pollAccessToken(
      CLIENT_ID,
      response.device_code,
      response.interval,
      response.expires_in
    );

    // Save it once we have it
    if (tokenResponse) {
      await saveCredentials(tokenResponse.access_token);
    }

    console.log("The token has been successfully saved");
  } catch (error) {
    if (error instanceof Error) {
      console.log("Login failed:", error.message);
    }
  }
}
