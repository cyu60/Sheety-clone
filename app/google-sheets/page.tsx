"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import axios from "axios";
import { extractSpreadsheetId } from "@/app/utils/helper";

export default function GoogleSheetsPage() {
  const { user } = useUser();
  const clerkId = user?.id;

  const getApiEndpoint = (sheetName: string) => {
    return `${window.location.origin}/api/${sheetName}`;
  };

  const [sheetLink, setSheetLink] = useState("");
  const [sheetData, setSheetData] = useState<string[][] | null>(null);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [mappings, setMappings] = useState<{ [key: string]: string }>({});
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<string[]>([]);
  const [isFetchingMappings, setIsFetchingMappings] = useState(false);
  const [range, setRange] = useState("Sheet1!A1:D");

  useEffect(() => {
    const fetchData = async () => {
      if (clerkId) {
        await fetchSheetMappings();
      }

      if (selectedSheet && sheetTitle && mappings[sheetTitle]) {
        await fetchUpdatedSheetData(mappings[sheetTitle], range);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkId, selectedSheet, sheetTitle, mappings, range]);

  const fetchSheetMappings = async () => {
    if (isFetchingMappings) return;
    setIsFetchingMappings(true);
    try {
      const response = await axios.get("/api/google-sheets/mapping");
      setMappings(response.data.mappings);
    } catch (error) {
      console.error("Error fetching sheet mappings:", error);
    } finally {
      setIsFetchingMappings(false);
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractSpreadsheetId(sheetLink);
    if (id) {
      await fetchSheetData(id);
    } else {
      alert("Invalid Google Sheets link.");
    }
  };

  const fetchSheetData = async (id: string) => {
    try {
      const res = await fetch(
        `/api/google-sheets/getData?spreadsheetId=${id}&range=Sheet1!A1:D`
      );
      const data = await res.json();
      if (res.ok) {
        setSheetData(data.data);
        setSheetTitle(data.title);
        setSheetNames(data.sheetNames || []);
        setSelectedSheet(
          (prevSelected) =>
            prevSelected || (data.sheetNames ? data.sheetNames[0] : "")
        );
        await addSheetMapping(data.title, id);
        await fetchSheetMappings();
      } else {
        alert(data.error || "Failed to fetch sheet data.");
      }
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      alert("Failed to fetch sheet data.");
    }
  };

  const fetchUpdatedSheetData = async (id: string, range: string) => {
    try {
      const res = await fetch(
        `/api/google-sheets/getData?spreadsheetId=${id}&range=${encodeURIComponent(
          range
        )}`
      );
      const data = await res.json();
      if (res.ok) {
        setSheetData(data.data);
      } else {
        alert(data.error || "Failed to fetch sheet data.");
      }
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      alert("Failed to fetch sheet data.");
    }
  };

  const addSheetMapping = async (sheetName: string, spreadsheetId: string) => {
    try {
      await axios.post("/api/google-sheets/mapping", {
        sheetName,
        spreadsheetId,
      });
      fetchSheetMappings(); // Refresh mappings
    } catch (error) {
      console.error("Error adding sheet mapping:", error);
    }
  };

  const removeSheetMapping = async (sheetName: string) => {
    try {
      await axios.delete("/api/google-sheets/mapping/delete", {
        data: { sheetName },
      });
      fetchSheetMappings(); // Refresh mappings
    } catch (error) {
      console.error("Error removing sheet mapping:", error);
    }
  };

  const handleEditRow = (rowIndex: number, rowData: string[]) => {
    setEditingRow(rowIndex);
    setEditedValues([...rowData]);
  };

  const handleUpdateRow = async (rowIndex: number) => {
    try {
      const response = await axios.put("/api/google-sheets/updateEntry", {
        clerkUserId: clerkId,
        spreadsheetId: mappings[sheetTitle],
        rowNumber: rowIndex + 1, // Add 1 because sheet rows are 1-based
        values: editedValues,
      });

      if (response.status === 200) {
        // Update local state
        const newSheetData = sheetData?.map((row, idx) =>
          idx === rowIndex ? editedValues : row
        );
        setSheetData(newSheetData || null);
        setEditingRow(null);
      }
    } catch (error) {
      console.error("Error updating row:", error);
      alert("Failed to update row");
    }
  };

  const handleDeleteRow = async (rowIndex: number) => {
    if (!confirm("Are you sure you want to delete this row?")) return;

    try {
      const response = await axios.delete("/api/google-sheets/deleteEntry", {
        data: {
          clerkUserId: clerkId,
          spreadsheetId: mappings[sheetTitle],
          rowNumber: rowIndex + 1,
        },
      });

      if (response.status === 200) {
        // Update local state
        const newSheetData = sheetData?.filter((_, idx) => idx !== rowIndex);
        setSheetData(newSheetData || null);
      }
    } catch (error) {
      console.error("Error deleting row:", error);
      alert("Failed to delete row");
    }
  };

  const handleAddRow = async () => {
    const newRow = Array(sheetData?.[0].length).fill("");
    try {
      const response = await axios.post("/api/google-sheets/addEntry", {
        clerkUserId: clerkId,
        spreadsheetId: mappings[sheetTitle],
        range: range,
        values: newRow,
      });

      if (response.status === 200) {
        // Update local state
        setSheetData([...(sheetData || []), newRow]);
      }
    } catch (error) {
      console.error("Error adding row:", error);
      alert("Failed to add row");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <form onSubmit={handleLinkSubmit} className="mb-8">
        <input
          type="text"
          value={sheetLink}
          onChange={(e) => setSheetLink(e.target.value)}
          placeholder="Enter Google Sheets link"
          className="w-full p-2 border rounded-md"
          required
        />
        <button
          type="submit"
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Fetch Sheet Data
        </button>
      </form>

      {/* Sheet Selection */}
      {/* {sheetNames.length > 1 && (
        <div className="mb-4">
          <label htmlFor="sheet-select" className="mr-2">
            Select Sheet:
          </label>
          <select
            id="sheet-select"
            value={selectedSheet}
            onChange={(e) => setSelectedSheet(e.target.value)}
            className="p-2 border rounded-md"
          >
            {sheetNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )} */}

      {/* Display Sheet Data */}
      {sheetData && (
        <div>
          <h2>{sheetTitle}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  {sheetData[0].map((header, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2 border-b-2 border-gray-200 bg-gray-100 text-left text-sm font-semibold text-gray-700"
                    >
                      {header}
                    </th>
                  ))}
                  <th className="px-4 py-2 border-b-2 border-gray-200 bg-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sheetData.slice(1).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {editingRow === idx ? (
                      <>
                        {row.map((_, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-2 border-b border-gray-200"
                          >
                            <input
                              type="text"
                              value={editedValues[cellIdx]}
                              onChange={(e) => {
                                const newValues = [...editedValues];
                                newValues[cellIdx] = e.target.value;
                                setEditedValues(newValues);
                              }}
                              className="w-full p-1 border rounded"
                            />
                          </td>
                        ))}
                        <td className="px-4 py-2 border-b border-gray-200">
                          <button
                            onClick={() => handleUpdateRow(idx)}
                            className="text-green-600 hover:text-green-800 mr-2"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingRow(null)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="px-4 py-2 border-b border-gray-200 text-sm text-gray-800"
                          >
                            {cell}
                          </td>
                        ))}
                        <td className="px-4 py-2 border-b border-gray-200">
                          <button
                            onClick={() => handleEditRow(idx, row)}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRow(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={handleAddRow}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Add Row
            </button>
          </div>
        </div>
      )}

      {/* Manage Sheet Mappings */}
      <div>
        <h3>Your Sheet Mappings</h3>
        <ul>
          {Object.entries(mappings).map(([name, id]) => (
            <li
              key={name}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-md shadow-sm"
            >
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-gray-600 break-all">{id}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm text-gray-600">
                    API Endpoint:{" "}
                    <span className="font-mono">{getApiEndpoint(name)}</span>
                  </p>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(getApiEndpoint(name) || "")
                    }
                    className="text-blue-500 hover:text-blue-600 text-sm"
                    title="Copy endpoint"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(id);
                    alert("Spreadsheet ID copied to clipboard!");
                  }}
                  className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Copy ID
                </button>
                <button
                  onClick={() => removeSheetMapping(name)}
                  className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
