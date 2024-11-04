import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { removeSheetMapping } from "@/app/lib/sheetMapping";

export async function DELETE(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sheetName } = await request.json();

    if (!sheetName) {
      return NextResponse.json({ error: "Missing sheetName" }, { status: 400 });
    }

    await removeSheetMapping(userId, sheetName);

    return NextResponse.json(
      { message: "Sheet mapping removed successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing sheet mapping:", error);
    return NextResponse.json(
      { error: "Failed to remove sheet mapping." },
      { status: 500 }
    );
  }
}
