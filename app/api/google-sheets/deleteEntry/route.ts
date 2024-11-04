import { NextResponse } from "next/server";
import { getOAuthClient } from "../../../lib/auth";
import { google } from "googleapis";

export async function DELETE(request: Request) {
  try {
    const { clerkUserId, spreadsheetId, rowNumber } = await request.json();

    if (!clerkUserId || !spreadsheetId || !rowNumber) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const oAuthClient = await getOAuthClient(clerkUserId);
    if (!oAuthClient) {
      return NextResponse.json(
        { error: "Authentication failed." },
        { status: 401 }
      );
    }

    const sheets = google.sheets({ version: "v4", auth: oAuthClient });

    // Get sheet ID (assuming first sheet)
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheetId = sheetInfo.data.sheets?.[0].properties?.sheetId;

    if (sheetId === undefined) {
      return NextResponse.json({ error: "Sheet not found." }, { status: 404 });
    }

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowNumber - 1, // 0-based index
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json(
      { message: "Row deleted successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting sheet entry:", error);
    return NextResponse.json(
      { error: "Failed to delete sheet entry." },
      { status: 500 }
    );
  }
}
