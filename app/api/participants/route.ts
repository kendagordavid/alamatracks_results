import { NextResponse } from "next/server";
import { fetchPublicParticipantsFromApi } from "@/services/participants-api";
import { ConfigurationError, getConfigurationHint } from "@/lib/errors";
import { ParticipantsApiError } from "@/types/participants";

export const revalidate = 30;

export async function GET() {
  try {
    const data = await fetchPublicParticipantsFromApi();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    if (error instanceof ParticipantsApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    if (error instanceof ConfigurationError) {
      return NextResponse.json(
        { error: getConfigurationHint(error) },
        { status: 503 },
      );
    }
    console.error("Participants API error:", error);
    return NextResponse.json(
      { error: getConfigurationHint(error) },
      { status: 500 },
    );
  }
}
