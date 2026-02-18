"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DynamicForm } from "@/components/demo/dynamic-form";
import { EngineConfigBanner } from "@/components/demo/engine-config-banner";
import { StatusPanel } from "@/components/demo/status-panel";
import { TemplatePicker } from "@/components/demo/template-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EngineClientError, submitEngineRequest } from "@/lib/engineClient";
import { TEMPLATES, type TemplateId } from "@/lib/templates";

function getSubmitErrorMessage(error: EngineClientError) {
  if (error.category === "not_configured") {
    return "Engine not configured";
  }
  if (error.category === "network_error") {
    return "Engine unreachable";
  }
  if (error.category === "timeout") {
    return "Engine timeout";
  }
  if (error.category === "engine_5xx") {
    return "Engine returned error";
  }
  return error.message;
}

export function DemoWorkspace() {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(TEMPLATES[0].id);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [configInstructions, setConfigInstructions] = useState<string[] | undefined>(undefined);

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === selectedTemplateId) ?? TEMPLATES[0],
    [selectedTemplateId],
  );

  async function onSubmit(payload: {
    applicant: Record<string, unknown>;
    application: Record<string, unknown>;
    options: Record<string, unknown>;
  }) {
    setSubmitError(null);
    setConfigInstructions(undefined);

    try {
      const response = await submitEngineRequest({
        template_id: selectedTemplate.id,
        selected_policy_pack: selectedTemplate.selectedPolicyPack,
        payload,
      });
      router.push(`/demo/${response.id}`);
    } catch (error) {
      if (error instanceof EngineClientError) {
        setSubmitError(getSubmitErrorMessage(error));
        if (error.category === "not_configured") {
          setConfigInstructions(error.instructions);
        }
        return;
      }
      setSubmitError("Engine request failed");
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-16">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-[#f5f5f5]">Eligibility evaluation</h1>
        <p className="text-sm text-[#a1a1aa]">
          Select a template, edit input fields, and run policy execution.
        </p>
      </header>

      {configInstructions ? <EngineConfigBanner instructions={configInstructions} /> : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template selection</CardTitle>
              <CardDescription>Choose one policy template before submitting.</CardDescription>
            </CardHeader>
            <CardContent>
              <TemplatePicker
                templates={TEMPLATES}
                selectedId={selectedTemplate.id}
                onSelect={setSelectedTemplateId}
              />
            </CardContent>
          </Card>

          <DynamicForm template={selectedTemplate} onSubmit={onSubmit} submitError={submitError} />
        </section>

        <aside className="space-y-4">
          <StatusPanel status="pending" />
          <Card>
            <CardHeader>
              <CardTitle>Decision result</CardTitle>
              <CardDescription>
                Result cards will be shown after request submission.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[#a1a1aa]">
                Submit the form to start processing request and open the request dashboard.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
