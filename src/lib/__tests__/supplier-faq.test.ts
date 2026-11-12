import { describe, expect, it } from "vitest";
import { parseFaqs } from "../supplier-faq";

describe("parseFaqs", () => {
  it("keeps well-formed question and answer pairs in order", () => {
    const faqs = parseFaqs([
      {
        question: "Do you supply perfumes throughout South Africa?",
        answer: "Yes, from Centurion, Pretoria, to customers nationwide.",
      },
      {
        question: "Do you offer wholesale fragrance products?",
        answer: "Yes, wholesale pricing is based on order volume.",
      },
    ]);

    expect(faqs).toHaveLength(2);
    expect(faqs[0].question).toBe("Do you supply perfumes throughout South Africa?");
    expect(faqs[1].answer).toBe("Yes, wholesale pricing is based on order volume.");
  });

  it("trims surrounding whitespace from stored questions and answers", () => {
    expect(
      parseFaqs([{ question: "  How do I order?  ", answer: "  Send an enquiry.  " }]),
    ).toEqual([{ question: "How do I order?", answer: "Send an enquiry." }]);
  });

  it("drops blank, malformed and non-array values instead of rendering them", () => {
    expect(parseFaqs(null)).toEqual([]);
    expect(parseFaqs(undefined)).toEqual([]);
    expect(parseFaqs("not a list")).toEqual([]);
    expect(parseFaqs({ question: "q", answer: "a" })).toEqual([]);
    expect(parseFaqs([{ question: "   ", answer: "a" }])).toEqual([]);
    expect(parseFaqs([{ question: "q" }])).toEqual([]);
    expect(parseFaqs([{ question: "q", answer: "" }])).toEqual([]);
  });
});
