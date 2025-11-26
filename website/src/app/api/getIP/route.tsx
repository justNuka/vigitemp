import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest
) {
    try {
        // console.log(request.headers.get("x-forwarded-for")?.split(":")[3])
        const ip = request.headers.get("x-forwarded-for")?.split(":")[3];
        
        return NextResponse.json(ip);
    } catch (error) {
        return NextResponse.json({
            error: error
        }, { status: 500 });
    }
}