import { describe, expect, it } from "vitest";
import { formatHash, parseHash } from "@/lib/hash-state";
import type { StyleState } from "@/lib/style-tokens";

const sample: StyleState = { density: 0.7, polish: 0.3, hierarchy: 0.5, motion: 0.2 };

describe("hash-state round trip", () => {
  it("formatHash produces the spec format with short keys", () => {
    expect(formatHash(sample)).toBe("d=0.7&p=0.3&h=0.5&m=0.2");
  });

  it("parseHash inverts formatHash", () => {
    const round = parseHash(`#${formatHash(sample)}`);
    expect(round).toEqual(sample);
  });

  it("parseHash accepts a hash without the # prefix", () => {
    expect(parseHash("d=0.5&p=0.5&h=0.5&m=0.5")).toEqual({
      density: 0.5,
      polish: 0.5,
      hierarchy: 0.5,
      motion: 0.5,
    });
  });

  it("parseHash returns null for empty hash", () => {
    expect(parseHash("")).toBeNull();
    expect(parseHash("#")).toBeNull();
  });

  it("parseHash returns null when any axis is missing", () => {
    expect(parseHash("#d=0.5&p=0.5&h=0.5")).toBeNull();
  });

  it("parseHash returns null when any axis is non-numeric", () => {
    expect(parseHash("#d=foo&p=0.5&h=0.5&m=0.5")).toBeNull();
  });

  it("parseHash clamps out-of-range values to [0,1]", () => {
    const parsed = parseHash("#d=-0.5&p=2&h=0.5&m=0.5");
    expect(parsed).toEqual({ density: 0, polish: 1, hierarchy: 0.5, motion: 0.5 });
  });

  it("formatHash rounds to 3 decimals", () => {
    expect(formatHash({ density: 0.123456, polish: 0.5, hierarchy: 0.5, motion: 0.5 })).toContain(
      "d=0.123",
    );
  });
});
