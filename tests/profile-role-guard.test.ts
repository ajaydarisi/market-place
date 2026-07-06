import { describe, expect, it } from "vitest";

import { updateProfileSchema } from "@shared/schema";

// F1: the self-service profile update API must never accept role 'admin'.
describe("updateProfileSchema role guard", () => {
  it("accepts client and developer", () => {
    expect(updateProfileSchema.parse({ role: "client" }).role).toBe("client");
    expect(updateProfileSchema.parse({ role: "developer" }).role).toBe("developer");
  });

  it("rejects admin", () => {
    expect(updateProfileSchema.safeParse({ role: "admin" }).success).toBe(false);
  });

  it("allows role to be omitted (non-role updates)", () => {
    expect(updateProfileSchema.safeParse({ headline: "Hi" }).success).toBe(true);
  });
});
