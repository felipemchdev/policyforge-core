import { z } from "zod";

import type { TemplateDefinition, TemplateField } from "@/lib/templates";

type SectionShape = Record<string, z.ZodTypeAny>;

function createFieldSchema(field: TemplateField) {
  const required = field.required ?? true;

  if (field.type === "number") {
    const numericSchema = z.coerce.number({
      error: "This value must be numeric.",
    });
    return required
      ? numericSchema
      : z.union([z.literal(""), numericSchema]).transform((value) => {
          return value === "" ? undefined : value;
        });
  }

  if (field.type === "boolean") {
    return z.boolean();
  }

  const textSchema = z.string().trim();
  return required ? textSchema.min(1, "This field is required.") : textSchema;
}

export function buildTemplateFormSchema(template: TemplateDefinition) {
  const applicantShape: SectionShape = {};
  const applicationShape: SectionShape = {};
  const optionsShape: SectionShape = {};

  for (const field of template.fields) {
    const target =
      field.section === "applicant"
        ? applicantShape
        : field.section === "application"
          ? applicationShape
          : optionsShape;
    target[field.key] = createFieldSchema(field);
  }

  return z.object({
    applicant: z.object(applicantShape),
    application: z.object(applicationShape),
    options: z.object(optionsShape),
  });
}
