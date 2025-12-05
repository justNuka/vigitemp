import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

export async function POST(request: Request) {
  // API de revalidation désactivée en production
  if (!FEATURE_FLAGS.enableRevalidateAPI) {
    return NextResponse.json(
      { error: "This API is only available in development" },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const { tag } = body;

    if (!tag) {
      return NextResponse.json(
        { error: "Tag parameter is required" },
        { status: 400 }
      );
    }

    // Invalider le cache pour le tag spécifié
    revalidateTag(tag, "default");

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for tag: ${tag}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error revalidating cache:", error);
    return NextResponse.json(
      { error: "Failed to revalidate cache" },
      { status: 500 }
    );
  }
}

// GET pour invalider tous les tags dashboard
export async function GET() {
  // API de revalidation désactivée en production
  if (!FEATURE_FLAGS.enableRevalidateAPI) {
    return NextResponse.json(
      { error: "This API is only available in development" },
      { status: 403 }
    );
  }

  try {
    revalidateTag("dashboard-stats", "default");
    revalidateTag("locations-list", "default");

    return NextResponse.json({
      success: true,
      message: "All dashboard caches invalidated",
      tags: ["dashboard-stats", "locations-list"],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error revalidating caches:", error);
    return NextResponse.json(
      { error: "Failed to revalidate caches" },
      { status: 500 }
    );
  }
}
