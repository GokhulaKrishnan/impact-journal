// Device Flow response
export interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

// Access token response
export interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

// Requesting the initial code from the Github server
export async function requestDeviceCode(
  clientId: string
): Promise<DeviceCodeResponse> {
  const response = await fetch("https://github.com/login/device/code", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `client_id=${clientId}&scope=public_repo,read:user`,
  });
  const data = await response.json();
  return data;
}

const sleep = (seconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};

// Poll for the access token
export async function pollAccessToken(
  clientId: string,
  deviceCode: string,
  interval: number,
  expiresIn: number
): Promise<AccessTokenResponse> {
  let sleepTime = interval;

  while (true) {
    await sleep(sleepTime);

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `client_id=${clientId}&device_code=${deviceCode}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
      }
    );

    const data = await response.json();

    if (data.access_token) {
      return data;
    }

    if (data.error == "authorization_pending") {
      continue;
    }

    if (data.error == "slow_down") {
      sleepTime += 5;
    }

    if (data.error == "expired_token") {
      throw new Error("Token expired");
    }

    if (data.error == "access_denied") {
      throw new Error("Access Denied");
    }
  }
}
