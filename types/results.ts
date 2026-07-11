import { z } from "zod";

export const publicParticipantSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  bib_number: z.string(),
});

export const publicResultSchema = z.object({
  id: z.string().uuid(),
  participant: publicParticipantSchema,
  category_name: z.string(),
  category_id: z.string().uuid(),
  distance: z.number(),
  position: z.number(),
  duration: z.union([z.number(), z.string()]).nullable(),
  finish_time: z.string().nullable(),
  start_time: z.string().nullable(),
});

export const publicEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  date: z.string(),
  location: z.string().nullable(),
  is_public: z.boolean(),
});

export const publicResultsResponseSchema = z.object({
  event: publicEventSchema,
  results: z.array(publicResultSchema),
});

export type PublicParticipant = z.infer<typeof publicParticipantSchema>;
export type PublicResult = z.infer<typeof publicResultSchema>;
export type PublicEvent = z.infer<typeof publicEventSchema>;
export type PublicResultsResponse = z.infer<typeof publicResultsResponseSchema>;

export type InferredGender = "male" | "female" | "other";

export type AthleteResult = PublicResult & {
  fullName: string;
  overallRank: number;
  chipTimeMs: number | null;
  gunTimeMs: number | null;
  pacePerKm: string | null;
  inferredGender: InferredGender;
  chipTimeFormatted: string | null;
  gunTimeFormatted: string | null;
};

export type EnrichedResultsPayload = {
  event: PublicEvent;
  results: AthleteResult[];
  fetchedAt: string;
};

export class ResultsApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ResultsApiError";
  }
}
