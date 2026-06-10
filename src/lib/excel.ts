import * as XLSX from "xlsx";
import type { RegistrationInput, Registration } from "./types";

/** Column indices for the REGISTROS sheet */
const REGISTROS_COLS = {
  TICKET: 0,
  CIP: 1,
  LAST_NAME: 2,
  FIRST_NAME: 3,
  CHAPTER: 4,
  SPECIALTY: 5,
  PHONE: 6,
  DATE: 7,
  DISH: 8,
} as const;

/** Number of meaningful columns in REGISTROS (skip aggregation columns) */
const REGISTROS_COL_COUNT = 9;

/** Column indices for the COMPRADOS sheet */
const COMPRADOS_COLS = {
  TICKET: 0,
  CIP: 1,
  DATE: 2,
  DISH: 3,
} as const;

/** Number of meaningful columns in COMPRADOS (skip aggregation columns) */
const COMPRADOS_COL_COUNT = 4;

/**
 * Converts an Excel serial date number to a JavaScript Date object.
 * Excel serial date 1 = 1900-01-01.
 */
function serialToDate(serial: number): Date {
  // Excel epoch is 1900-01-01, but there's the famous leap-year bug
  const epoch = new Date(1899, 11, 30);
  const days = Math.floor(serial);
  const fractional = serial - days;
  const totalMs = days * 86_400_000 + fractional * 86_400_000;
  return new Date(epoch.getTime() + totalMs);
}

/**
 * Safely converts a cell value to a string, returning null for empty values.
 */
function cellToString(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
}

/**
 * Parses the REGISTROS sheet: returns registration inputs with source="REGISTROS".
 */
function parseRegistrosSheet(
  sheet: XLSX.WorkSheet
): RegistrationInput[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    range: 1, // skip header row (index 0)
  });

  const results: RegistrationInput[] = [];

  for (const row of rows) {
    if (!Array.isArray(row)) continue;

    // Skip completely empty rows
    const ticketCell = row[REGISTROS_COLS.TICKET];
    if (ticketCell === null || ticketCell === undefined) continue;

    const trimmed = row.slice(0, REGISTROS_COL_COUNT);

    const ticketNumber = cellToString(trimmed[REGISTROS_COLS.TICKET]);
    if (!ticketNumber) continue;

    let purchaseDate: Date | null = null;
    const dateCell = trimmed[REGISTROS_COLS.DATE];
    if (typeof dateCell === "number") {
      purchaseDate = serialToDate(dateCell);
    }

    results.push({
      ticketNumber,
      source: "REGISTROS",
      cip: cellToString(trimmed[REGISTROS_COLS.CIP]),
      lastName: cellToString(trimmed[REGISTROS_COLS.LAST_NAME]),
      firstName: cellToString(trimmed[REGISTROS_COLS.FIRST_NAME]),
      chapter: cellToString(trimmed[REGISTROS_COLS.CHAPTER]),
      specialty: cellToString(trimmed[REGISTROS_COLS.SPECIALTY]),
      phone: cellToString(trimmed[REGISTROS_COLS.PHONE]),
      purchaseDate,
      dish: cellToString(trimmed[REGISTROS_COLS.DISH]),
    });
  }

  return results;
}

/**
 * Parses the COMPRADOS sheet: returns registration inputs with source="COMPRADOS".
 * This sheet only has ticket number, CIP, date, and dish.
 */
function parseCompradosSheet(
  sheet: XLSX.WorkSheet
): RegistrationInput[] {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    range: 1, // skip header row
  });

  const results: RegistrationInput[] = [];

  for (const row of rows) {
    if (!Array.isArray(row)) continue;

    const ticketCell = row[COMPRADOS_COLS.TICKET];
    if (ticketCell === null || ticketCell === undefined) continue;

    const trimmed = row.slice(0, COMPRADOS_COL_COUNT);

    const ticketNumber = cellToString(trimmed[COMPRADOS_COLS.TICKET]);
    if (!ticketNumber) continue;

    let purchaseDate: Date | null = null;
    const dateCell = trimmed[COMPRADOS_COLS.DATE];
    if (typeof dateCell === "number") {
      purchaseDate = serialToDate(dateCell);
    }

    results.push({
      ticketNumber,
      source: "COMPRADOS",
      cip: cellToString(trimmed[COMPRADOS_COLS.CIP]),
      lastName: null,
      firstName: null,
      chapter: null,
      specialty: null,
      phone: null,
      purchaseDate,
      dish: cellToString(trimmed[COMPRADOS_COLS.DISH]),
    });
  }

  return results;
}

/**
 * Parses an Excel file buffer and returns all registrations from both sheets.
 */
export function parseExcelFile(buffer: ArrayBuffer): RegistrationInput[] {
  const workbook = XLSX.read(buffer, { type: "array" });

  const registros: RegistrationInput[] = [];
  const comprados: RegistrationInput[] = [];

  if (workbook.SheetNames.includes("REGISTROS")) {
    const sheet = workbook.Sheets["REGISTROS"];
    registros.push(...parseRegistrosSheet(sheet));
  }

  if (workbook.SheetNames.includes("COMPRADOS")) {
    const sheet = workbook.Sheets["COMPRADOS"];
    comprados.push(...parseCompradosSheet(sheet));
  }

  return [...registros, ...comprados];
}

/**
 * Creates an Excel workbook with a REPORTE sheet containing all registrations
 * plus attendance status and check-in time.
 */
export function buildExportWorkbook(
  registrations: Registration[]
): XLSX.WorkBook {
  const headers = [
    "NRO TICKET",
    "CIP",
    "APELLIDOS",
    "NOMBRES",
    "CAPITULO",
    "ESPECIALIDAD",
    "TELEFONO",
    "FECHA Y HORA",
    "PLATO",
    "ORIGEN",
    "ASISTIO",
    "HORA CHECK-IN",
  ];

  const data = registrations.map((r) => [
    r.ticketNumber,
    r.cip ?? "",
    r.lastName ?? "",
    r.firstName ?? "",
    r.chapter ?? "",
    r.specialty ?? "",
    r.phone ?? "",
    r.purchaseDate ? formatDate(r.purchaseDate) : "",
    r.dish ?? "",
    r.source,
    r.attended ? "SI" : "NO",
    r.checkinTime ? formatDate(r.checkinTime) : "",
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Auto-fit column widths
  const colWidths = headers.map((_, i) => {
    const maxLen = Math.max(
      headers[i].length,
      ...data.map((row) => String(row[i] ?? "").length)
    );
    return { wch: Math.min(maxLen + 2, 30) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "REPORTE");
  return wb;
}

function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
