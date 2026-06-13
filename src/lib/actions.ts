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

    // Deduplicate inputs by ticketNumber (keep the last occurrence to avoid duplicate key conflicts in a single query)
    const uniqueInputsMap = new Map<string, typeof inputs[number]>();
    for (const input of inputs) {
      uniqueInputsMap.set(input.ticketNumber, input);
    }
    const uniqueInputs = Array.from(uniqueInputsMap.values());

    // Get count before insert to calculate exact inserts vs updates
    const beforeCountRes = await db.select({ count: sql<number>`count(*)` }).from(registrations);
    const beforeCount = Number(beforeCountRes[0].count);

    // Batch upsert in chunks of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < uniqueInputs.length; i += CHUNK_SIZE) {
      const chunk = uniqueInputs.slice(i, i + CHUNK_SIZE);
      
      await db.insert(registrations)
        .values(chunk)
        .onConflictDoUpdate({
          target: registrations.ticketNumber,
          set: {
            source: sql`EXCLUDED.source`,
            cip: sql`EXCLUDED.cip`,
            lastName: sql`EXCLUDED.last_name`,
            firstName: sql`EXCLUDED.first_name`,
            chapter: sql`EXCLUDED.chapter`,
            specialty: sql`EXCLUDED.specialty`,
            phone: sql`EXCLUDED.phone`,
            purchaseDate: sql`EXCLUDED.purchase_date`,
            dish: sql`EXCLUDED.dish`,
          }
        });
    }

    // Get count after insert
    const afterCountRes = await db.select({ count: sql<number>`count(*)` }).from(registrations);
    const afterCount = Number(afterCountRes[0].count);

    const inserted = afterCount - beforeCount;
    const updated = uniqueInputs.length - inserted;

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
