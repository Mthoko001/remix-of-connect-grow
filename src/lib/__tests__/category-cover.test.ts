import { describe, expect, it } from "vitest";
import { categoryCover } from "../category-cover";

describe("categoryCover", () => {
  it("picks the agriculture cover", () => expect(categoryCover("Agriculture")).toMatch(/agriculture/));
  it("picks the tech cover for IT", () => expect(categoryCover("Information Technology")).toMatch(/tech/));
  it("falls back to the business cover", () => expect(categoryCover("Other")).toMatch(/business/));
});
