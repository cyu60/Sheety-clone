import { NextResponse } from "next/server";
import { getOAuthClient } from "../../../lib/auth";
import { google } from "googleapis";

export async function PUT(request: Request) {
  try {
    const { clerkUserId, spreadsheetId, rowNumber, values } =
      await request.json();

    if (!clerkUserId || !spreadsheetId || !rowNumber || !values) {
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

    // Update the row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${rowNumber}:D${rowNumber}`, // Adjust range as needed
      valueInputOption: "RAW",
      requestBody: {
        values: [values],
      },
    });

    return NextResponse.json(
      { message: "Row updated successfully." },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating sheet entry:", error);
    return NextResponse.json(
      { error: "Failed to update sheet entry." },
      { status: 500 }
    );
  }
}
