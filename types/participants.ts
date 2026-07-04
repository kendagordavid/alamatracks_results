import { z } from "zod";
import { publicEventSchema } from "@/types/results";

export const publicParticipantEntrySchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  bib_number: z.string(),
  category_name: z.string(),
  category_id: z.string().uuid(),
});

export const publicParticipantsResponseSchema = z.object({
  event: publicEventSchema,
  participants: z.array(publicParticipantEntrySchema),
});

export type PublicParticipantEntry = z.infer<typeof publicParticipantEntrySchema>;
export type PublicParticipantsResponse = z.infer<
  typeof publicParticipantsResponseSchema
>;

export type EnrichedParticipant = PublicParticipantEntry & {
  fullName: string;
};

export type ParticipantsPayload = {
  event: PublicParticipantsResponse["event"];
  participants: EnrichedParticipant[];
  fetchedAt: string;
};

export class ParticipantsApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ParticipantsApiError";
  }
}
