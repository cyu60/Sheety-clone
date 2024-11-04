export function extractSpreadsheetId(sheetLink: string): string | null {
  try {
    const url = new URL(sheetLink);
    const pathSegments = url.pathname.split("/");

    const dIndex = pathSegments.findIndex((segment) => segment === "d");
    if (dIndex === -1 || dIndex + 1 >= pathSegments.length) {
      return null;
    }

    return pathSegments[dIndex + 1];
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}
