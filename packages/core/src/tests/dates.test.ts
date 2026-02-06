import {
  getStartOfDay,
  getStartOfMonth,
  getStartOfWeek,
  isWithinRange,
} from "../utils/dates";

describe("getStartOfDay", () => {
  it("should return the midnight of the same day", () => {
    const date = new Date("2026-01-15T14:30:00");
    const result = getStartOfDay(date);

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getDate()).toBe(15);
  });
});

describe("isWithinRange", () => {
  it("should return true if date is within range", () => {
    const date = new Date("2026-01-15");
    const start = new Date("2026-01-10");
    const end = new Date("2026-01-20");

    expect(isWithinRange(date, start, end)).toBe(true);
  });

  it("should return false if date is outside range", () => {
    const date = new Date("2026-01-25");
    const start = new Date("2026-01-10");
    const end = new Date("2026-01-20");

    expect(isWithinRange(date, start, end)).toBe(false);
  });
});

describe("getStartOfWeek - edge cases", () => {
  it("should handle Sunday (already start of week)", () => {
    const date = new Date("2026-01-11T14:30:00");
    const result = getStartOfWeek(date);

    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(11);
  });

  it("should handle Saturday (end of week)", () => {
    const date = new Date("2026-01-17T23:59:59");
    const result = getStartOfWeek(date);

    expect(result.getDay()).toBe(0);
    expect(result.getDate()).toBe(11);
  });

  it("should handle week crossing month boundary", () => {
    const date = new Date("2026-02-03T10:00:00");
    const result = getStartOfWeek(date);

    expect(result.getDay()).toBe(0);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(1);
  });
});

describe("getStartOfMonth - edge cases", () => {
  it("should handle first day of month", () => {
    const date = new Date("2026-01-01T14:30:00");
    const result = getStartOfMonth(date);

    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
  });

  it("should handle last day of month", () => {
    const date = new Date("2026-01-31T23:59:59");
    const result = getStartOfMonth(date);

    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(0);
  });
});

describe("isWithinRange - edge cases", () => {
  it("should return true for date exactly at start", () => {
    const date = new Date("2026-01-10T00:00:00");
    const start = new Date("2026-01-10T00:00:00");
    const end = new Date("2026-01-20T00:00:00");

    expect(isWithinRange(date, start, end)).toBe(true);
  });

  it("should return true for date exactly at end", () => {
    const date = new Date("2026-01-20T00:00:00");
    const start = new Date("2026-01-10T00:00:00");
    const end = new Date("2026-01-20T00:00:00");

    expect(isWithinRange(date, start, end)).toBe(true);
  });

  it("should handle same start and end date", () => {
    const date = new Date("2026-01-15T12:00:00");
    const start = new Date("2026-01-15T00:00:00");
    const end = new Date("2026-01-15T23:59:59");

    expect(isWithinRange(date, start, end)).toBe(true);
  });
});

describe("getStartOfWeek - tricky cases", () => {
  it("should handle year boundary", () => {
    const date = new Date("2026-01-02T10:00:00");
    const result = getStartOfWeek(date);

    expect(result.getDay()).toBe(0);
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(11);
    expect(result.getDate()).toBe(28);
  });
});

describe("getStartOfMonth - tricky cases", () => {
  it("should handle leap year February", () => {
    const date = new Date("2024-02-29T14:30:00");
    const result = getStartOfMonth(date);

    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(1);
  });
});

describe("isWithinRange - time sensitivity", () => {
  it("should handle time differences on same day", () => {
    const date = new Date("2026-01-15T06:00:00");
    const start = new Date("2026-01-15T08:00:00");
    const end = new Date("2026-01-15T20:00:00");

    expect(isWithinRange(date, start, end)).toBe(false);
  });
});
