import { describe, expect, it } from "vitest";
import {
  firstPasswordError,
  isStrongPassword,
  passwordStrength,
  PRIVACY_VERSION,
  TERMS_VERSION,
} from "../policies";

describe("password strength", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(isStrongPassword("Ab1!def")).toBe(false);
  });
  it("requires upper, lower, number and special character", () => {
    expect(isStrongPassword("abcdefg1!")).toBe(false);
    expect(isStrongPassword("ABCDEFG1!")).toBe(false);
    expect(isStrongPassword("Abcdefgh!")).toBe(false);
    expect(isStrongPassword("Abcdefg1")).toBe(false);
    expect(isStrongPassword("StrongPassword123!")).toBe(true);
  });
  it("gives a specific message for the missing rule", () => {
    expect(firstPasswordError("abcdefg1!")).toBe(
      "Password must contain at least one uppercase letter.",
    );
    expect(firstPasswordError("StrongPassword123!")).toBeNull();
  });
  it("rates strength weak / medium / strong", () => {
    expect(passwordStrength("abc")).toBe("weak");
    expect(passwordStrength("Abcdefgh")).toBe("medium");
    expect(passwordStrength("StrongPassword123!")).toBe("strong");
  });
});

describe("policy versions", () => {
  it("starts at version 1.0", () => {
    expect(TERMS_VERSION).toBe("1.0");
    expect(PRIVACY_VERSION).toBe("1.0");
  });
});
