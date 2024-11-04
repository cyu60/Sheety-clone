import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISheetMapping extends Document {
  userId: string; // Clerk user ID
  sheetName: string;
  spreadsheetId: string;
}

const SheetMappingSchema: Schema = new Schema<ISheetMapping>(
  {
    userId: { type: String, required: true },
    sheetName: { type: String, required: true },
    spreadsheetId: { type: String, required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite upon initial compile
export const SheetMapping: Model<ISheetMapping> =
  mongoose.models.SheetMapping ||
  mongoose.model<ISheetMapping>("SheetMapping", SheetMappingSchema);
