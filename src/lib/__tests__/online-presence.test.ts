import { describe, expect, it } from "vitest";
import { detectPlatform, normalizeLinks, normalizeUrl, publicSocialLinks } from "../online-presence";

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
  it("never exposes supplier websites through public social links", () => {
    expect(publicSocialLinks(["https://supplier.co.za", "https://facebook.com/supplier", "https://instagram.com/supplier"])).toEqual([
      "https://facebook.com/supplier", "https://instagram.com/supplier",
    ]);
  });
  it("does not treat lookalike website domains as social networks", () => {
    expect(publicSocialLinks(["https://supplierfacebook.com", "https://fakeinstagram.com", "https://linkedin.com.supplier.co.za"])).toEqual([]);
  });
});
