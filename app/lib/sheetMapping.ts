import dbConnect from "./mongodb";
import { SheetMapping, ISheetMapping } from "../models/SheetMapping";

/**
 * Retrieves the spreadsheetId for a given sheetName and user.
 * @param userId - The Clerk user ID.
 * @param sheetName - The name identifier for the sheet.
 * @returns The corresponding Google Spreadsheet ID or undefined if not found.
 */
export async function getSpreadsheetId(
  userId: string,
  sheetName: string
): Promise<string | undefined> {
  await dbConnect();
  const mapping = await SheetMapping.findOne({
    userId,
    sheetName: sheetName ? sheetName : "",
  });
  return mapping?.spreadsheetId;
}

/**
 * Adds a new sheet mapping.
 * @param userId - The Clerk user ID.
 * @param sheetName - The name identifier for the sheet.
 * @param spreadsheetId - The Google Spreadsheet ID.
 */
export async function addSheetMapping(
  userId: string,
  sheetName: string,
  spreadsheetId: string
): Promise<ISheetMapping> {
  await dbConnect();
  const mapping = new SheetMapping({
    userId,
    sheetName: sheetName.toLowerCase(),
    spreadsheetId,
  });
  return mapping.save();
}

/**
 * Removes an existing sheet mapping.
 * @param userId - The Clerk user ID.
 * @param sheetName - The name identifier for the sheet.
 */
export async function removeSheetMapping(
  userId: string,
  sheetName: string
): Promise<void> {
  await dbConnect();
  await SheetMapping.deleteOne({
    userId,
    sheetName: sheetName.toLowerCase(),
  });
}

/**
 * Lists all current sheet mappings for a user.
 * @param userId - The Clerk user ID.
 * @returns An object containing all sheet mappings.
 */
export async function listSheetMappings(
  userId: string
): Promise<{ [key: string]: string }> {
  await dbConnect();
  const mappings = await SheetMapping.find({ userId });
  const mappingObj: { [key: string]: string } = {};
  mappings.forEach((mapping) => {
    mappingObj[mapping.sheetName] = mapping.spreadsheetId;
  });
  return mappingObj;
}
