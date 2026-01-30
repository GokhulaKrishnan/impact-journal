export {
  requestDeviceCode,
  pollAccessToken,
  type DeviceCodeResponse,
  type AccessTokenResponse,
} from "./services/auth.js";

export { getAuthenticatedUser } from "./services/github.js";
export function greet(name: string): string {
  return `Hello, ${name}!`;
}
