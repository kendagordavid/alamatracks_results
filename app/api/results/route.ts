import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fetchPublicResultsFromApi } from "@/services/results-api";
import { ConfigurationError, getConfigurationHint } from "@/lib/errors";
import { ResultsApiError } from "@/types/results";

export const dynamic = "force-dynamic";
export const revalidate = 30;

export async function GET() {
  try {
    const data = await fetchPublicResultsFromApi();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    if (error instanceof ResultsApiError) {
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
    if (error instanceof ZodError) {
      console.error("Results API schema error:", error.flatten());
      return NextResponse.json(
        {
          error:
            "Results data from the API did not match the expected format. The site may need an update — try again after the latest deploy finishes.",
        },
        { status: 502 },
      );
    }
    console.error("Results API error:", error);
    return NextResponse.json(
      { error: getConfigurationHint(error) },
      { status: 500 },
    );
  }
}
