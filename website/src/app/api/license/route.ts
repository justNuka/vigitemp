import { NextResponse } from "next/server";
import { validateLicense } from "@/lib/license-server";

export async function GET() {
  const payload = await validateLicense();
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
