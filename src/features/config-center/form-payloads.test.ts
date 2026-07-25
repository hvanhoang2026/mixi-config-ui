import { describe, expect, it } from "vitest";
import { toProjectForm } from "./form-payloads";

describe("config-center form payloads", () => {
  it("removes server-managed project fields before an update", () => {
    expect(
      toProjectForm({
        id: "project-1",
        createdAt: "2026-07-25T00:00:00.000Z",
        updatedAt: "2026-07-25T01:00:00.000Z",
        name: "Gateway",
        code: "gateway",
        description: "API gateway",
      }),
    ).toEqual({
      name: "Gateway",
      code: "gateway",
      description: "API gateway",
    });
  });
});
