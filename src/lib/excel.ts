import * as XLSX from "xlsx";
import type { RegistrationInput, Registration } from "./types";

/** Column aliases for REGISTROS sheet */
const REGISTROS_ALIASES = {
  TICKET: ["nroticket", "ticket", "numeroticket", "noticket", "nro", "n", "nroticketcorrelativo"],
  CIP: ["cip", "colegiado", "colegio"],
  LAST_NAME: ["apellidos", "apellido", "lastnames", "lastname"],
  FIRST_NAME: ["nombres", "nombre", "firstnames", "firstname"],
  CHAPTER: ["capitulo", "capitulos", "chapter"],
  SPECIALTY: ["especialidad", "especialidades", "specialty", "speciality"],
  PHONE: ["telefono", "celular", "telefonocelular", "phone", "telef", "telf"],
  DATE: ["fechayhora", "fecha", "hora", "fechahora", "date", "datetime"],
  DISH: ["plato", "platoelegido", "almuerzo", "dish", "comida"],
};

/** Default fallbacks for REGISTROS if headers aren't detected */
const REGISTROS_FALLBACKS = {
  TICKET: 0,
  CIP: 1,
  LAST_NAME: 2,
  FIRST_NAME: 3,
  CHAPTER: 4,
  SPECIALTY: 5,
  PHONE: 6,
  DATE: 7,
  DISH: 8,
};

/** Column aliases for COMPRADOS sheet */
const COMPRADOS_ALIASES = {
  TICKET: ["nroticket", "ticket", "numeroticket", "noticket", "nro", "n"],
  CIP: ["cip", "colegiado", "colegio"],
  DATE: ["fechayhora", "fecha", "hora", "fechahora", "date", "datetime"],
  DISH: ["plato", "platoelegido", "almuerzo", "dish", "comida"],
};

/** Default fallbacks for COMPRADOS if headers aren't detected */
const COMPRADOS_FALLBACKS = {
  TICKET: 0,
  CIP: 1,
  DATE: 2,
  DISH: 3,
};

/**
 * Converts an Excel serial date number to a JavaScript Date object.
 * Excel serial date 1 = 1900-01-01.
 */
function serialToDate(serial: number): Date {
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
 * Cleans numeric values (like ticket number or CIP) to strip trailing decimals.
 */
function cleanNumericString(value: unknown): string | null {
  const str = cellToString(value);
  if (!str) return null;
  if (/^\d+\.0$/.test(str)) {
    return str.split(".")[0];
  }
  return str;
}

/**
 * Truncates a string to fit within DB limits.
 */
function truncate(str: string | null, length: number): string | null {
  if (!str) return null;
  return str.substring(0, length);
}

/**
 * Parses any date cell value (serial, string, Date).
 */
function parseDateCell(value: unknown): Date | null {
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    return serialToDate(value);
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value.trim());
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
  }
  return null;
}

/**
 * Normalizes a header string for matching.
 */
function normalizeHeader(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, ""); // Keep only alphanumeric
}

/**
 * Finds column indices dynamically by matching headers against aliases.
 */
function findColumnIndices(
  headers: unknown[],
  expected: Record<string, string[]>,
  fallbacks: Record<string, number>
): Record<string, number> {
  const mapping: Record<string, number> = {};
  
  // Initialize mapping
  for (const key of Object.keys(expected)) {
    mapping[key] = -1;
  }

  for (let i = 0; i < headers.length; i++) {
    const norm = normalizeHeader(headers[i]);
    if (!norm) continue;

    for (const [key, aliases] of Object.entries(expected)) {
      if (aliases.includes(norm)) {
        mapping[key] = i;
        break;
      }
    }
  }

  // Fallback if not found
  for (const key of Object.keys(expected)) {
    if (mapping[key] === -1) {
      mapping[key] = fallbacks[key];
    }
  }

  return mapping;
}

/**
 * Parses the REGISTROS sheet: returns registration inputs with source="REGISTROS".
 */
function parseRegistrosSheet(sheet: XLSX.WorkSheet): RegistrationInput[] {
  const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
  });

  if (allRows.length === 0) return [];

  const headers = allRows[0];
  const dataRows = allRows.slice(1);

  const cols = findColumnIndices(headers, REGISTROS_ALIASES, REGISTROS_FALLBACKS);
  const results: RegistrationInput[] = [];

  for (const row of dataRows) {
    if (!Array.isArray(row)) continue;

    const ticketCell = row[cols.TICKET];
    if (ticketCell === null || ticketCell === undefined) continue;

    const ticketNumber = truncate(cleanNumericString(ticketCell), 20);
    if (!ticketNumber) continue;

    const purchaseDate = parseDateCell(row[cols.DATE]);

    results.push({
      ticketNumber,
      source: "REGISTROS",
      cip: truncate(cleanNumericString(row[cols.CIP]), 20),
      lastName: truncate(cellToString(row[cols.LAST_NAME]), 200),
      firstName: truncate(cellToString(row[cols.FIRST_NAME]), 200),
      chapter: truncate(cellToString(row[cols.CHAPTER]), 200),
      specialty: truncate(cellToString(row[cols.SPECIALTY]), 200),
      phone: truncate(cleanNumericString(row[cols.PHONE]), 20),
      purchaseDate,
      dish: truncate(cellToString(row[cols.DISH]), 20),
    });
  }

  return results;
}

/**
 * Parses the COMPRADOS sheet: returns registration inputs with source="COMPRADOS".
 */
function parseCompradosSheet(sheet: XLSX.WorkSheet): RegistrationInput[] {
  const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
  });

  if (allRows.length === 0) return [];

  const headers = allRows[0];
  const dataRows = allRows.slice(1);

  const cols = findColumnIndices(headers, COMPRADOS_ALIASES, COMPRADOS_FALLBACKS);
  const results: RegistrationInput[] = [];

  for (const row of dataRows) {
    if (!Array.isArray(row)) continue;

    const ticketCell = row[cols.TICKET];
    if (ticketCell === null || ticketCell === undefined) continue;

    const ticketNumber = truncate(cleanNumericString(ticketCell), 20);
    if (!ticketNumber) continue;

    const purchaseDate = parseDateCell(row[cols.DATE]);

    results.push({
      ticketNumber,
      source: "COMPRADOS",
      cip: truncate(cleanNumericString(row[cols.CIP]), 20),
      lastName: null,
      firstName: null,
      chapter: null,
      specialty: null,
      phone: null,
      purchaseDate,
      dish: truncate(cellToString(row[cols.DISH]), 20),
    });
  }

  return results;
}

/**
 * Parses an Excel file buffer and returns all registrations from both sheets.
 */
export function parseExcelFile(buffer: ArrayBuffer): RegistrationInput[] {
  // Use cellDates: true to let SheetJS parse dates automatically
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  const registros: RegistrationInput[] = [];
  const comprados: RegistrationInput[] = [];

  const sheetNames = workbook.SheetNames;

  // Case-insensitive search for "REGISTROS" and "COMPRADOS"
  const registrosName = sheetNames.find(n => n.toUpperCase().trim() === "REGISTROS");
  if (registrosName) {
    const sheet = workbook.Sheets[registrosName];
    registros.push(...parseRegistrosSheet(sheet));
  }

  const compradosName = sheetNames.find(n => n.toUpperCase().trim() === "COMPRADOS");
  if (compradosName) {
    const sheet = workbook.Sheets[compradosName];
    comprados.push(...parseCompradosSheet(sheet));
  }

  // Fallback: if neither sheet was found, check if there's just a single sheet and parse it as REGISTROS
  if (!registrosName && !compradosName && sheetNames.length === 1) {
    const sheet = workbook.Sheets[sheetNames[0]];
    registros.push(...parseRegistrosSheet(sheet));
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
    r.purchaseDate ? formatDateToLima(r.purchaseDate) : "",
    r.dish ?? "",
    r.source,
    r.attended ? "SI" : "NO",
    r.checkinTime ? formatDateToLima(r.checkinTime) : "",
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

function formatDateToLima(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    
    const parts = formatter.formatToParts(date);
    const partMap: Record<string, string> = {};
    for (const part of parts) {
      partMap[part.type] = part.value;
    }
    
    return `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}:${partMap.second}`;
  } catch (err) {
    // Fallback if Intl fails
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
