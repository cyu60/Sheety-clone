import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import {
  getSheetData,
  createSheetEntry,
  updateSheetEntry,
  deleteSheetEntry,
} from "@/app/lib/googleSheets";
import { getSpreadsheetId } from "@/app/lib/sheetMapping";

/**
 * Handles GET, POST, PUT, DELETE requests for a specific sheet.
 */
export async function GET(
  request: NextRequest,
  context: { params: { sheetName: string } }
) {
  try {
    // Await the params
    const { sheetName } = context.params;

    console.log("sheetName", sheetName);

    const { userId } = getAuth(request);

    console.log("userId", userId);
    const spreadsheetId = await getSpreadsheetId(userId!, sheetName);

    console.log("spreadsheetId", spreadsheetId);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID not configured for this sheet." },
        { status: 400 }
      );
    }

    // **Ensure the sheet name is properly quoted**
    const range = `Sheet1!A1:Z`; // Correctly quoted sheet name

    const { title, values } = await getSheetData(userId!, spreadsheetId, range);
    return NextResponse.json({ title, data: values }, { status: 200 });
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return NextResponse.json(
      { error: "Failed to fetch sheet data." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { nameOfSheet: string; sheetName: string } }
) {
  try {
    const { nameOfSheet, sheetName } = params;
    const { userId } = getAuth(request);
    const spreadsheetId = await getSpreadsheetId(userId!, nameOfSheet);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID not configured for this sheet." },
        { status: 400 }
      );
    }

    const range = `${sheetName}!A1:Z`; // Adjust the range as needed

    const { values } = await request.json();

    if (!values || !Array.isArray(values)) {
      return NextResponse.json(
        { error: "Invalid data format." },
        { status: 400 }
      );
    }

    const response = await createSheetEntry({
      clerkUserId: userId!,
      spreadsheetId,
      range,
      values,
    });

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error("Error adding sheet entry:", error);
    return NextResponse.json(
      { error: "Failed to add sheet entry." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { nameOfSheet: string; sheetName: string } }
) {
  try {
    const { nameOfSheet, sheetName } = params;
    const { userId } = getAuth(request);
    const spreadsheetId = await getSpreadsheetId(userId!, nameOfSheet);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID not configured for this sheet." },
        { status: 400 }
      );
    }

    const { rowNumber, values } = await request.json();

    if (!rowNumber || !values || !Array.isArray(values)) {
      return NextResponse.json(
        { error: "Invalid data format." },
        { status: 400 }
      );
    }

    const rangeToUpdate = `${sheetName}!A${rowNumber}:Z${rowNumber}`; // Adjust as needed

    await updateSheetEntry(userId!, spreadsheetId, rangeToUpdate, values);
    return NextResponse.json(
      { message: "Row updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating sheet entry:", error);
    return NextResponse.json(
      { error: "Failed to update sheet entry." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { nameOfSheet: string; sheetName: string } }
) {
  try {
    const { nameOfSheet, sheetName } = params;
    const { userId } = getAuth(request);
    const spreadsheetId = await getSpreadsheetId(userId!, nameOfSheet);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID not configured for this sheet." },
        { status: 400 }
      );
    }

    const { rowNumber } = await request.json();

    if (!rowNumber) {
      return NextResponse.json(
        { error: "Row number is required." },
        { status: 400 }
      );
    }

    await deleteSheetEntry(userId!, spreadsheetId, sheetName, rowNumber);

    return NextResponse.json(
      { message: "Row deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting sheet entry:", error);
    return NextResponse.json(
      { error: "Failed to delete sheet entry." },
      { status: 500 }
    );
  }
}
