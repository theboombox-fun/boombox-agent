import { z } from "zod";

export const GeneratedResponse = z.object({
  event_type: z.string(),
  event_message: z.string(),
  response: z.string(),
  new_box_info: z.object({
    sound_url: z.string().optional().nullable().default("")
  }),
});

export type GeneratedResponseType = z.infer<typeof GeneratedResponse>;

export const GeneratedSubstance = z.object({
  name: z.string(),
  ticker: z.string(),
  visual_prompt: z.string(),
});

export type GeneratedSubstanceType = z.infer<typeof GeneratedSubstance>;

export const GeneratedClassification = z.object({
  classification: z.string(),
  caption: z.string(),
  speech_status: z.string(),
});

export type GeneratedClassificationType = z.infer<typeof GeneratedClassification>;

export const GeneratedVisual = z.object({
  description: z.string(),
  character: z.string(),
  visual_elements: z.array(z.string()),
  color_palette: z.array(z.string()),
  style_notes: z.string(),
});

export type GeneratedVisualType = z.infer<typeof GeneratedVisual>;

export const GeneratedSpeechAnalysis = z.object({
  speech_status: z.string(),
  summary: z.string(),
});

export type GeneratedSpeechAnalysisType = z.infer<typeof GeneratedSpeechAnalysis>;