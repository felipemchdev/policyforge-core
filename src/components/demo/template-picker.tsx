import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TemplateDefinition, TemplateId } from "@/lib/templates";
import { cn } from "@/lib/utils";

interface TemplatePickerProps {
  templates: TemplateDefinition[];
  selectedId: TemplateId;
  onSelect: (id: TemplateId) => void;
}

export function TemplatePicker({ templates, selectedId, onSelect }: TemplatePickerProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => {
        const selected = template.id === selectedId;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            className="w-full text-left"
            aria-pressed={selected}
          >
            <Card
              className={cn(
                "h-full transition hover:border-slate-400",
                selected ? "border-slate-900 ring-2 ring-slate-900/20" : "",
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{template.label}</CardTitle>
                  {selected ? <Badge variant="success">Selected</Badge> : null}
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-600">
                  Suggested policy pack:{" "}
                  <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">
                    {template.selectedPolicyPack}
                  </code>
                </p>
              </CardContent>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
