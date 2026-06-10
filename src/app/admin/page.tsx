"use client";

import { useActionState, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { uploadExcel, clearAll, getStats } from "@/lib/actions";
import type { UploadResult, DashboardStats } from "@/lib/types";

export default function AdminPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Load stats on mount
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    const data = await getStats();
    setStats(data);
    setLoadingStats(false);
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // Upload
  const [uploadState, uploadAction, isUploading] = useActionState(
    async (_prev: UploadResult | null, formData: FormData): Promise<UploadResult | null> => {
      return await uploadExcel(formData);
    },
    null
  );

  useEffect(() => {
    if (!uploadState) return;
    if (uploadState.success) {
      Swal.fire({
        icon: "success",
        title: "Importación completada",
        html: `
          <div class="text-center space-y-3 py-2">
            <div class="text-5xl">✅</div>
            <p class="text-lg font-semibold text-green-700">Datos importados correctamente</p>
            <div class="inline-block bg-green-50 rounded-xl px-6 py-3 space-y-1">
              <p class="text-gray-700">📥 <strong>${uploadState.counts.inserted}</strong> registros nuevos</p>
              <p class="text-gray-700">🔄 <strong>${uploadState.counts.updated}</strong> actualizados</p>
            </div>
            ${uploadState.errors.length > 0
              ? `<div class="mt-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">⚠️ ${uploadState.errors.length} error(es) menores</div>`
              : ""}
          </div>
        `,
        confirmButtonColor: "#1e3a5f",
        confirmButtonText: "OK",
      });
      loadStats(); // refresh
      formRef.current?.reset();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al importar",
        text: uploadState.errors.join(", ") || "Ocurrió un error desconocido",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "Cerrar",
      });
    }
  }, [uploadState, loadStats]);

  // Clear
  const handleClear = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar todos los datos?",
      text: "Esta acción no se puede deshacer. Todos los registros se borrarán permanentemente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar todo",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    const res = await clearAll();
    if (res.success) {
      await Swal.fire({
        icon: "success",
        title: "Datos eliminados",
        text: "Todos los registros han sido eliminados correctamente.",
        confirmButtonColor: "#1e3a5f",
        confirmButtonText: "OK",
      });
      loadStats(); // refresh
    } else {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron eliminar los datos. Intente nuevamente.",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "Cerrar",
      });
    }
  };

  // Export
  const handleExport = () => {
    Swal.fire({
      title: "Descargando...",
      html: `
        <div class="flex flex-col items-center gap-4 py-4">
          <div class="animate-spin h-10 w-10 border-4 border-blue-900 border-t-transparent rounded-full"></div>
          <p class="text-gray-600">Generando archivo Excel...</p>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        const link = document.createElement("a");
        link.href = "/api/export";
        link.click();
        setTimeout(() => Swal.close(), 1500);
      },
    });
  };

  const StatCard = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white py-6 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-center">Panel de Administración</h1>
          <Link
            href="/"
            className="text-blue-200 text-sm underline mt-2 block text-center hover:text-blue-100"
          >
            ← Volver al check-in
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6 mt-6 pb-16">
        {/* ===== DASHBOARD STATS ===== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
            <button
              onClick={loadStats}
              disabled={loadingStats}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <svg className={`w-4 h-4 ${loadingStats ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>

          {loadingStats && !stats ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-900 border-t-transparent rounded-full"></div>
            </div>
          ) : !stats || stats.total === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📊</p>
              <p className="font-medium">No hay datos cargados</p>
              <p className="text-sm">Subí un Excel para ver las estadísticas</p>
            </div>
          ) : (
            <>
              {/* Main counters */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total tickets" value={stats.total} color="bg-blue-100" icon="🎫" />
                <StatCard label="Asistieron" value={stats.attended} color="bg-green-100" icon="✅" />
                <StatCard label="Faltan" value={stats.pending} color="bg-yellow-100" icon="⏳" />
                <StatCard label="Sin plato" value={stats.byDish.sinPlato} color="bg-red-100" icon="❓" />
              </div>

              {/* Secondary stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* By dish */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Distribución por plato</p>
                  <div className="space-y-2">
                    <Bar label="Pollo" value={stats.byDish.pollo} total={stats.total} color="bg-orange-500" />
                    {stats.byDish.chancho > 0 && <Bar label="Chancho" value={stats.byDish.chancho} total={stats.total} color="bg-red-500" />}
                    {stats.byDish.sinPlato > 0 && <Bar label="Sin plato" value={stats.byDish.sinPlato} total={stats.total} color="bg-gray-400" />}
                  </div>
                </div>

                {/* By source */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Origen</p>
                  <div className="space-y-2">
                    <Bar label="REGISTROS (gratis)" value={stats.bySource.registros} total={stats.total} color="bg-blue-600" />
                    <Bar label="COMPRADOS" value={stats.bySource.comprados} total={stats.total} color="bg-teal-500" />
                  </div>
                  <div className="mt-3 flex gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block"></span> Gratis</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-500 inline-block"></span> Comprados</span>
                  </div>
                </div>

                {/* Attendance rate */}
                <div className="bg-gray-50 rounded-xl p-4 col-span-1 md:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Asistencia</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.total > 0 ? (stats.attended / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-700 min-w-[80px] text-right">
                      {stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>✅ {stats.attended} asistieron</span>
                    <span>⏳ {stats.pending} pendientes</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ===== CONFIG / MANAGEMENT ===== */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
            <span>⚙️</span> Configuración
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Upload */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="text-3xl mb-2">📤</div>
              <h3 className="font-bold text-gray-800 mb-1">Subir Excel</h3>
              <p className="text-xs text-gray-500 mb-4">Importar datos del evento (hojas REGISTROS + COMPRADOS)</p>
              <form ref={formRef} action={uploadAction} className="space-y-3">
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  required
                  disabled={isUploading}
                  className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-900 file:text-white file:font-medium hover:file:bg-blue-800 file:cursor-pointer file:transition-colors cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed text-sm"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Subiendo...
                    </span>
                  ) : (
                    "Importar Excel"
                  )}
                </button>
              </form>
            </div>

            {/* Clear */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="text-3xl mb-2">🗑️</div>
              <h3 className="font-bold text-gray-800 mb-1">Limpiar Datos</h3>
              <p className="text-xs text-gray-500 mb-4">Eliminar todos los registros de la base de datos</p>
              <button
                onClick={handleClear}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-sm"
              >
                Eliminar todos los datos
              </button>
            </div>

            {/* Export */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="text-3xl mb-2">📥</div>
              <h3 className="font-bold text-gray-800 mb-1">Exportar Resultados</h3>
              <p className="text-xs text-gray-500 mb-4">Descargar Excel con registros + asistencia</p>
              <button
                onClick={handleExport}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer text-sm"
              >
                Descargar Excel
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-400">
        <p>CIP - Colegio de Ingenieros del Perú</p>
      </footer>
    </div>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
