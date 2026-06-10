import { NextResponse } from "next/server";
import { db } from "@/db";
import { registrations } from "@/db/schema";
import { asc } from "drizzle-orm";
import { buildExportWorkbook } from "@/lib/excel";
import * as XLSX from "xlsx";
import type { Registration } from "@/lib/types";

export async function GET() {
  try {
    const results = await db
      .select()
      .from(registrations)
      .orderBy(asc(registrations.ticketNumber));

    const wb = buildExportWorkbook(results as Registration[]);
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="reporte-cip-checkin.xlsx"',
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al exportar los datos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
