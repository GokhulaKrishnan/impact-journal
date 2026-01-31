export {
  requestDeviceCode,
  pollAccessToken,
  type DeviceCodeResponse,
  type AccessTokenResponse,
} from "./services/auth.js";

export {
  getAuthenticatedUser,
  getUserRepos,
  getRepoCommits,
  getUserPullRequests,
} from "./services/github.js";

export {
  getStartOfWeek,
  getStartOfMonth,
  getStartOfDay,
  isWithinRange,
} from "./utils/dates.js";

export function greet(name: string): string {
  return `Hello, ${name}!`;
}
