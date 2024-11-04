import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getSheetData } from "@/app/lib/googleSheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const spreadsheetId = searchParams.get("spreadsheetId");
  const range = searchParams.get("range");

  if (!spreadsheetId || !range) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const { userId } = getAuth(request as NextRequest);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, values } = await getSheetData(userId, spreadsheetId, range);
    return NextResponse.json({ title, data: values });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheet data" },
      { status: 500 }
    );
  }
}
