"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { DynamicForm } from "@/components/demo/dynamic-form";
import { EngineOfflineBanner } from "@/components/demo/engine-offline-banner";
import { TemplatePicker } from "@/components/demo/template-picker";
import { submitEngineRequest, EngineClientError } from "@/lib/engineClient";
import { TEMPLATES, type TemplateId } from "@/lib/templates";

export function DemoWorkspace() {
  const router = useRouter();
  const [selectedTemplateId, setSelectedTemplateId] = useState<TemplateId>(TEMPLATES[0].id);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [offlineInstructions, setOfflineInstructions] = useState<string[] | undefined>(undefined);

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
    setOfflineInstructions(undefined);

    try {
      const response = await submitEngineRequest({
        template_id: selectedTemplate.id,
        selected_policy_pack: selectedTemplate.selectedPolicyPack,
        payload,
      });
      router.push(`/demo/${response.id}`);
    } catch (error) {
      if (error instanceof EngineClientError) {
        setSubmitError(error.message);
        if (error.offline) {
          setOfflineInstructions(error.instructions);
        }
        return;
      }
      setSubmitError("Unexpected error while submitting the request.");
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">PolicyForge Demo</h1>
        <p className="text-slate-700">
          Select a template, edit the data, and run a policy evaluation.
        </p>
      </header>

      {offlineInstructions ? <EngineOfflineBanner instructions={offlineInstructions} /> : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">1. Pick a template</h2>
        <TemplatePicker
          templates={TEMPLATES}
          selectedId={selectedTemplate.id}
          onSelect={setSelectedTemplateId}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">2. Submit request</h2>
        <DynamicForm template={selectedTemplate} onSubmit={onSubmit} submitError={submitError} />
      </section>
    </div>
  );
}
