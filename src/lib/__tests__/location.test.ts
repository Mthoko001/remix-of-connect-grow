import { describe, expect, it } from "vitest";
import { formatCityProvince, formatFullAddress, formatShortLocation } from "../location";

describe("formatShortLocation", () => {
  it("shows suburb, city and province code", () => {
    expect(formatShortLocation({ suburb: "Risecliff", city: "eThekwini", province: "KwaZulu-Natal" })).toBe(
      "Risecliff, eThekwini, KZN",
    );
  });
  it("drops a missing city", () => {
    expect(formatShortLocation({ suburb: "Risecliff", province: "KwaZulu-Natal" })).toBe("Risecliff, KZN");
  });
  it("shows province with country when only province exists", () => {
    expect(formatShortLocation({ province: "KwaZulu-Natal" })).toBe("KwaZulu-Natal, South Africa");
  });
  it("never includes street or postal code", () => {
    const s = formatShortLocation({ suburb: "Risecliff", city: "eThekwini", province: "KwaZulu-Natal", streetAddress: "12 Main Rd", postalCode: "4051" });
    expect(s).not.toContain("Main");
    expect(s).not.toContain("4051");
  });
});

describe("formatFullAddress", () => {
  it("is empty when no street address was provided", () => {
    expect(formatFullAddress({ suburb: "Risecliff", city: "eThekwini" })).toBe("");
  });
});

describe("formatCityProvince", () => {
  it("shows only city and province", () => {
    expect(formatCityProvince({ city: "Durban", province: "KwaZulu-Natal" })).toBe("Durban, KwaZulu-Natal");
  });
  it("drops municipality wording", () => {
    expect(formatCityProvince({ city: "eThekwini Metropolitan Municipality", province: "KwaZulu-Natal" })).toBe("eThekwini, KwaZulu-Natal");
  });
  it("shows province alone when no city", () => {
    expect(formatCityProvince({ province: "Gauteng" })).toBe("Gauteng");
  });
});
