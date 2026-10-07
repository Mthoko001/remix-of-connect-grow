import { describe, expect, it } from "vitest";
import { isStrongPassword, PRIVACY_VERSION, TERMS_VERSION } from "../policies";

describe("password strength", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(isStrongPassword("Ab1cdef")).toBe(false);
  });
  it("requires upper, lower and a number", () => {
    expect(isStrongPassword("abcdefg1")).toBe(false);
    expect(isStrongPassword("ABCDEFG1")).toBe(false);
    expect(isStrongPassword("Abcdefgh")).toBe(false);
    expect(isStrongPassword("Abcdefg1")).toBe(true);
  });
});

describe("policy versions", () => {
  it("starts at version 1.0", () => {
    expect(TERMS_VERSION).toBe("1.0");
    expect(PRIVACY_VERSION).toBe("1.0");
  });
});
