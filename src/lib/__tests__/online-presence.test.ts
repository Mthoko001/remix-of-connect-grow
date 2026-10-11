import { describe, expect, it } from "vitest";
import { detectPlatform, normalizeLinks, normalizeUrl } from "../online-presence";

describe("online presence links", () => {
  it("adds https:// when omitted", () => {
    expect(normalizeUrl("www.mybiz.co.za")).toBe("https://www.mybiz.co.za/");
  });
  it("rejects invalid URLs", () => {
    expect(normalizeUrl("not a url")).toBeNull();
    expect(normalizeUrl("javascript://alert(1)")).toBeNull();
  });
  it("ignores empty social fields", () => {
    expect(normalizeLinks(["", "  ", "facebook.com/biz"]).valid).toEqual(["https://facebook.com/biz"]);
  });
  it("detects the platform for icons", () => {
    expect(detectPlatform("https://x.com/biz")).toBe("x");
    expect(detectPlatform("https://www.tiktok.com/@biz")).toBe("tiktok");
  });
});
