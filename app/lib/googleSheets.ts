import { google } from "googleapis";
import { getOAuthClient } from "./auth";

/**
 * Fetches sheet data along with sheet names.
 */
export async function getSheetData(
  clerkUserId: string,
  spreadsheetId: string,
  range: string
) {
  const oAuthClient = await getOAuthClient(clerkUserId);
  const sheets = google.sheets("v4");

  // Fetch spreadsheet metadata to get sheet names
  const spreadsheetResponse = await sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: false,
    auth: oAuthClient,
  });

  const sheetNames = spreadsheetResponse.data.sheets?.map(
    (sheet) => sheet.properties?.title || "Sheet1"
  ) || ["Sheet1"];

  // Fetch the desired range data
  const valuesResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    auth: oAuthClient,
  });

  return {
    title: spreadsheetResponse.data.properties?.title || "Untitled Spreadsheet",
    sheetNames,
    values: valuesResponse.data.values || [],
  };
}

/**
 * Creates a new sheet entry.
 */
export async function createSheetEntry({
  clerkUserId,
  spreadsheetId,
  range,
  values,
}: {
  clerkUserId: string;
  spreadsheetId: string;
  range: string;
  values: unknown[];
}) {
  const oAuthClient = await getOAuthClient(clerkUserId);
  const sheets = google.sheets("v4");

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    auth: oAuthClient,
    requestBody: {
      values: [values],
    },
  });

  return response.data;
}

/**
 * Updates an existing sheet entry.
 */
export async function updateSheetEntry(
  clerkUserId: string,
  spreadsheetId: string,
  range: string,
  values: unknown[]
) {
  const oAuthClient = await getOAuthClient(clerkUserId);
  const sheets = google.sheets("v4");

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [values],
    },
    auth: oAuthClient,
  });
}

/**
 * Deletes a sheet entry.
 */
export async function deleteSheetEntry(
  clerkUserId: string,
  spreadsheetId: string,
  sheetName: string,
  rowNumber: number
) {
  const oAuthClient = await getOAuthClient(clerkUserId);
  const sheets = google.sheets({ version: "v4", auth: oAuthClient });

  // Get sheet ID
  const sheetInfo = await sheets.spreadsheets.get({
    spreadsheetId,
  });
  const sheetId = sheetInfo.data.sheets?.find(
    (sheet) => sheet.properties?.title === sheetName
  )?.properties?.sheetId;

  if (sheetId === undefined) {
    throw new Error("Sheet not found.");
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
}
