import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { addSheetMapping, listSheetMappings } from "@/app/lib/sheetMapping";

/**
 * Handles GET and POST requests for sheet mappings.
 */
export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mappings = await listSheetMappings(userId);
    return NextResponse.json({ mappings }, { status: 200 });
  } catch (error) {
    console.error("Error listing sheet mappings:", error);
    return NextResponse.json(
      { error: "Failed to list sheet mappings." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sheetName, spreadsheetId } = await request.json();

    if (!sheetName || !spreadsheetId) {
      return NextResponse.json(
        { error: "Missing sheetName or spreadsheetId" },
        { status: 400 }
      );
    }

    await addSheetMapping(userId, sheetName, spreadsheetId);

    return NextResponse.json(
      { message: "Sheet mapping added successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding sheet mapping:", error);
    return NextResponse.json(
      { error: "Failed to add sheet mapping." },
      { status: 500 }
    );
  }
}
