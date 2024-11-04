import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { createSheetEntry } from "@/app/lib/googleSheets";

export async function POST(request: NextRequest) {
  const { clerkUserId, spreadsheetId, range, values } = await request.json();

  if (!spreadsheetId || !range || !values) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const { userId } = getAuth(request as NextRequest);
  if (!userId || userId !== clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await createSheetEntry({
      clerkUserId: userId,
      spreadsheetId,
      range,
      values,
    });
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error adding sheet entry:", error);
    return NextResponse.json(
      { error: "Failed to add sheet entry" },
      { status: 500 }
    );
  }
}
