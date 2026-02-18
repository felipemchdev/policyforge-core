"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TemplateDefinition, TemplateSection } from "@/lib/templates";
import { buildTemplateFormSchema } from "@/schemas/templateForm";

type FormValues = {
  applicant: Record<string, unknown>;
  application: Record<string, unknown>;
  options: Record<string, unknown>;
};

interface DynamicFormProps {
  template: TemplateDefinition;
  onSubmit: (payload: FormValues) => Promise<void>;
  submitError: string | null;
}

const SECTION_LABELS: Record<TemplateSection, string> = {
  applicant: "Applicant",
  application: "Application",
  options: "Options",
};

function getFieldPath(section: TemplateSection, key: string) {
  return `${section}.${key}` as const;
}

export function DynamicForm({ template, onSubmit, submitError }: DynamicFormProps) {
  const schema = useMemo(() => buildTemplateFormSchema(template), [template]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: template.defaultPayload as FormValues,
  });

  useEffect(() => {
    form.reset(template.defaultPayload as FormValues);
  }, [form, template]);

  const sections: TemplateSection[] = ["applicant", "application", "options"];
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application form</CardTitle>
        <CardDescription>
          Fill the fields and submit to run an evaluation in the selected policy pack.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(async (values) => onSubmit(values))}
          className="space-y-8"
        >
          {sections.map((section) => {
            const fields = template.fields.filter((field) => field.section === section);
            return (
              <section key={section} className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                  {SECTION_LABELS[section]}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {fields.map((field) => {
                    const path = getFieldPath(field.section, field.key);
                    const error = (form.formState.errors as Record<string, unknown>)[
                      field.section
                    ] as Record<string, { message?: string }> | undefined;
                    const message = error?.[field.key]?.message;

                    return (
                      <div key={path} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                        <Label htmlFor={path}>{field.label}</Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            id={path}
                            {...form.register(path)}
                            placeholder={field.helperText}
                          />
                        ) : field.type === "select" ? (
                          <Select id={path} {...form.register(path)}>
                            <option value="">Select...</option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        ) : field.type === "boolean" ? (
                          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                            <input
                              id={path}
                              type="checkbox"
                              className="h-4 w-4 rounded border-slate-300"
                              {...form.register(path)}
                            />
                            Enabled
                          </label>
                        ) : (
                          <Input
                            id={path}
                            type={field.type === "number" ? "number" : field.type}
                            step={field.type === "number" ? "any" : undefined}
                            {...form.register(path)}
                          />
                        )}
                        {typeof message === "string" ? (
                          <p className="mt-1 text-xs text-rose-600">{message}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {submitError ? (
            <p className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {submitError}
            </p>
          ) : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Run evaluation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
