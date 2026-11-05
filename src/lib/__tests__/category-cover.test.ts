import { describe, expect, it } from "vitest";
import { categoryCover } from "../category-cover";

describe("categoryCover", () => {
  it("picks the agriculture cover", () => expect(categoryCover("Agriculture")).toMatch(/agriculture/));
  it("picks the tech cover for IT", () => expect(categoryCover("Information Technology")).toMatch(/tech/));
  it("falls back to the business cover", () => expect(categoryCover("Other")).toMatch(/business/));
});

describe("categoryCover industry matches", () => {
  it("plumbing", () => expect(categoryCover("Plumbing")).toMatch(/plumbing/));
  it("hair salon", () => expect(categoryCover("Hair Salon")).toMatch(/salon/));
  it("catering", () => expect(categoryCover("Catering")).toMatch(/catering/));
  it("auto repair", () => expect(categoryCover("Auto Repair")).toMatch(/auto/));
  it("uses service categories when main category is generic", () =>
    expect(categoryCover("Other", "Gardening")).toMatch(/gardening/));
});
