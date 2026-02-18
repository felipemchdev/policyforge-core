import { describe, expect, it } from "vitest";

import { TEMPLATES } from "@/lib/templates";
import { buildTemplateFormSchema } from "@/schemas/templateForm";

describe("template form schema", () => {
  it("accepts default payload from a template", () => {
    const template = TEMPLATES[0];
    const schema = buildTemplateFormSchema(template);

    const result = schema.safeParse(template.defaultPayload);
    expect(result.success).toBe(true);
  });

  it("rejects payload with missing required fields", () => {
    const template = TEMPLATES[1];
    const schema = buildTemplateFormSchema(template);
    const invalidPayload = structuredClone(template.defaultPayload);
    delete invalidPayload.applicant.full_name;

    const result = schema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
