"use server";

import { db } from "@/db";
import { registrations } from "@/db/schema";
import { eq, like, sql } from "drizzle-orm";
import { parseExcelFile } from "@/lib/excel";
import type {
  SearchResult,
  CheckinResult,
  UploadResult,
  ClearResult,
  DashboardStats,
  Registration,
} from "@/lib/types";

/**
 * Returns dashboard statistics (counts).
 */
export async function getStats(): Promise<DashboardStats> {
  try {
    const all = await db.select().from(registrations);

    const total = all.length;
    const attended = all.filter((r) => r.attended).length;
    const pending = total - attended;
    const pollo = all.filter((r) => r.dish?.toLowerCase() === "pollo").length;
    const chancho = all.filter((r) => r.dish?.toLowerCase() === "chancho").length;
    const sinPlato = all.filter((r) => !r.dish).length;
    const registros = all.filter((r) => r.source === "REGISTROS").length;
    const comprados = all.filter((r) => r.source === "COMPRADOS").length;

    return { total, attended, pending, byDish: { pollo, chancho, sinPlato }, bySource: { registros, comprados } };
  } catch {
    return { total: 0, attended: 0, pending: 0, byDish: { pollo: 0, chancho: 0, sinPlato: 0 }, bySource: { registros: 0, comprados: 0 } };
  }
}

/**
 * Searches for a registration by ticket number (case-insensitive).
 */
export async function searchTicket(
  ticketNumber: string
): Promise<SearchResult> {
  if (!ticketNumber || ticketNumber.trim().length === 0) {
    return { success: false, error: "Ingrese un número de ticket" };
  }

  try {
    const results = await db
      .select()
      .from(registrations)
      .where(
        sql`LOWER(${registrations.ticketNumber}) = LOWER(${ticketNumber.trim()})`
      )
      .limit(1);

    if (results.length === 0) {
      return {
        success: false,
        error: `No se encontró el ticket ${ticketNumber}`,
      };
    }

    return { success: true, data: results[0] as Registration };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al buscar el ticket";
    return { success: false, error: message };
  }
}

/**
 * Confirms a check-in for the given ticket number.
 * Optionally updates the dish selection.
 */
export async function confirmCheckin(
  ticketNumber: string,
  dish?: string
): Promise<CheckinResult> {
  if (!ticketNumber || ticketNumber.trim().length === 0) {
    return { success: false, message: "Ingrese un número de ticket" };
  }

  try {
    const results = await db
      .select()
      .from(registrations)
      .where(
        sql`LOWER(${registrations.ticketNumber}) = LOWER(${ticketNumber.trim()})`
      )
      .limit(1);

    if (results.length === 0) {
      return {
        success: false,
        message: `No se encontró el ticket ${ticketNumber}`,
      };
    }

    const existing = results[0];

    // Build update fields
    const updateFields: Record<string, unknown> = {
      attended: true,
      checkinTime: new Date(),
    };

    // Only update dish if explicitly provided
    if (dish !== undefined && dish !== null) {
      updateFields.dish = dish;
    }

    await db
      .update(registrations)
      .set(updateFields)
      .where(eq(registrations.id, existing.id));

    return { success: true, message: `Check-in confirmado para ticket ${ticketNumber}` };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al confirmar check-in";
    return { success: false, message };
  }
}

/**
 * Uploads an Excel file, parses it, and upserts all registrations.
 * Uses ticket_number as the unique key for upsert.
 */
export async function uploadExcel(formData: FormData): Promise<UploadResult> {
  const errors: string[] = [];
  let inserted = 0;
  let updated = 0;

  try {
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return { success: false, counts: { inserted: 0, updated: 0 }, errors: ["No se encontró el archivo"] };
    }

    const buffer = await file.arrayBuffer();
    const inputs = parseExcelFile(buffer);

    if (inputs.length === 0) {
      return { success: false, counts: { inserted: 0, updated: 0 }, errors: ["No se encontraron registros en el archivo"] };
    }

    for (const input of inputs) {
      try {
        // Check if ticket already exists
        const existing = await db
          .select({ id: registrations.id })
          .from(registrations)
          .where(eq(registrations.ticketNumber, input.ticketNumber))
          .limit(1);

        if (existing.length > 0) {
          // Update existing
          await db
            .update(registrations)
            .set({
              source: input.source,
              cip: input.cip,
              lastName: input.lastName,
              firstName: input.firstName,
              chapter: input.chapter,
              specialty: input.specialty,
              phone: input.phone,
              purchaseDate: input.purchaseDate,
              dish: input.dish,
            })
            .where(eq(registrations.ticketNumber, input.ticketNumber));
          updated++;
        } else {
          // Insert new
          await db.insert(registrations).values({
            ticketNumber: input.ticketNumber,
            source: input.source,
            cip: input.cip,
            lastName: input.lastName,
            firstName: input.firstName,
            chapter: input.chapter,
            specialty: input.specialty,
            phone: input.phone,
            purchaseDate: input.purchaseDate,
            dish: input.dish,
          });
          inserted++;
        }
      } catch (rowErr) {
        const msg =
          rowErr instanceof Error
            ? rowErr.message
            : "Error al procesar fila";
        errors.push(`Ticket ${input.ticketNumber}: ${msg}`);
      }
    }

    return { success: true, counts: { inserted, updated }, errors };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al procesar el archivo";
    return { success: false, counts: { inserted: 0, updated: 0 }, errors: [message] };
  }
}

/**
 * Deletes all registrations from the database.
 */
export async function clearAll(): Promise<ClearResult> {
  try {
    await db.delete(registrations);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

/**
 * Returns all registrations in the database.
 */
export async function getAllRegistrations(): Promise<Registration[]> {
  try {
    const list = await db.select().from(registrations);
    return list as Registration[];
  } catch {
    return [];
  }
}
