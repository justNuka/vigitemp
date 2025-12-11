import { NextResponse } from "next/server";
import { getCacheStats, clearAllMeasurementCaches } from "@/lib/measurement-cache";

export async function GET() {
  try {
    const stats = getCacheStats();
    return NextResponse.json({
      status: "success",
      cache: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cache stats error:", error);
    return NextResponse.json(
      { error: "Failed to get cache stats" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    clearAllMeasurementCaches();
    return NextResponse.json({
      status: "success",
      message: "All measurement caches cleared",
    });
  } catch (error) {
    console.error("Cache clear error:", error);
    return NextResponse.json(
      { error: "Failed to clear caches" },
      { status: 500 }
    );
  }
}
