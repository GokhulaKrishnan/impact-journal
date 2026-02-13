export {
  requestDeviceCode,
  pollAccessToken,
  type DeviceCodeResponse,
  type AccessTokenResponse,
} from "./services/auth.js";

export * from "./services/github";

export {
  getStartOfWeek,
  getStartOfMonth,
  getStartOfDay,
  isWithinRange,
} from "./utils/dates.js";

export { createAiSummary } from "./services/ai.js";

export { generateSummary, type SummaryResult } from "./services/summary.js";
export { generateStandup, type StandupResult } from "./services/standup.js";

export * from "./services/file-analyzer";

export * from "./utils/storage.js";

export function greet(name: string): string {
  return `Hello, ${name}!`;
}
