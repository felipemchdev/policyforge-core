import { z } from "zod";

export const templatePayloadSchema = z.object({
  applicant: z.record(z.string(), z.unknown()),
  application: z.record(z.string(), z.unknown()),
  options: z.record(z.string(), z.unknown()),
});

export const createEngineRequestInputSchema = z.object({
  template_id: z.string().min(1),
  selected_policy_pack: z.string().min(1),
  payload: templatePayloadSchema,
});

export const createEngineRequestResponseSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
});

export const engineRequestStatusSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
  submitted_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const engineRequestResultSchema = z.object({
  id: z.string().min(1),
  decision: z.string().min(1),
  reasons: z.array(z.string()),
  computed_fields: z.record(z.string(), z.unknown()),
  artifacts: z
    .record(
      z.string(),
      z.object({
        signed_url: z.string().url().optional(),
        endpoint: z.string().optional(),
      }),
    )
    .optional(),
});

export const proxyErrorSchema = z.object({
  error: z.string().min(1),
  code: z.string().optional(),
  instructions: z.array(z.string()).optional(),
  technical_status: z.string().optional(),
});

export type CreateEngineRequestInput = z.infer<typeof createEngineRequestInputSchema>;
export type CreateEngineRequestResponse = z.infer<typeof createEngineRequestResponseSchema>;
export type EngineRequestStatus = z.infer<typeof engineRequestStatusSchema>;
export type EngineRequestResult = z.infer<typeof engineRequestResultSchema>;
export type ProxyError = z.infer<typeof proxyErrorSchema>;
