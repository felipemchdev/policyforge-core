import { describe, expect, it } from "vitest";

import { TEMPLATES } from "@/lib/templates";

describe("templates catalog", () => {
  it("contains exactly 10 templates", () => {
    expect(TEMPLATES).toHaveLength(10);
  });

  it("has unique template ids", () => {
    const ids = TEMPLATES.map((template) => template.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("contains only the 3 supported policy packs", () => {
    const packs = new Set(TEMPLATES.map((template) => template.selectedPolicyPack));
    expect([...packs].sort()).toEqual(
      ["education_core_pack", "financial_aid_pack", "mobility_research_pack"].sort(),
    );
  });
});
