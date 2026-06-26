import { NextResponse } from "next/server";
import {
  fetchPublicResultsFromApi,
} from "@/services/results-api";
import { ResultsApiError } from "@/types/results";

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
    console.error("Results API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
