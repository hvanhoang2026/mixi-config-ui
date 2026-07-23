import { describe, expect, it } from "vitest";
import { getSafeNextPath } from "../../features/auth/safe-redirect";

describe("getSafeNextPath", () => {
  it("accepts internal application paths", () => {
    expect(getSafeNextPath("/config-center?account=profile")).toBe(
      "/config-center?account=profile",
    );
  });

  it("rejects external and protocol-relative redirects", () => {
    expect(getSafeNextPath("https://attacker.example")).toBe("/config-center");
    expect(getSafeNextPath("//attacker.example")).toBe("/config-center");
  });
});
