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
          <div class="text-center space-y-4 py-2 font-sans">
            <div class="text-5xl animate-bounce">📊</div>
            <p class="text-lg font-bold text-emerald-600 font-display">Datos importados con éxito</p>
            <div class="inline-block bg-emerald-50/50 border border-emerald-100 rounded-2xl px-6 py-4 space-y-2 w-full text-left">
              <p class="text-gray-700 font-medium flex justify-between"><span>📥 Registros nuevos:</span> <strong class="text-emerald-700">${uploadState.counts.inserted}</strong></p>
              <p class="text-gray-700 font-medium flex justify-between"><span>🔄 Actualizados:</span> <strong class="text-emerald-700">${uploadState.counts.updated}</strong></p>
            </div>
            ${uploadState.errors.length > 0
              ? `<div class="mt-3 p-3 bg-amber-50 rounded-xl text-xs text-amber-700 border border-amber-100 text-left">⚠️ ${uploadState.errors.length} error(es) menores</div>`
              : ""}
          </div>
        `,
        confirmButtonColor: "#8b1b1b",
        confirmButtonText: "Entendido",
      });
      loadStats(); // refresh
      formRef.current?.reset();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al importar",
        text: uploadState.errors.join(", ") || "Ocurrió un error desconocido",
        confirmButtonColor: "#8b1b1b",
        confirmButtonText: "Cerrar",
      });
    }
  }, [uploadState, loadStats]);

  // Clear
  const handleClear = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar todos los datos?",
      text: "Esta acción no se puede deshacer. Todos los registros se borrarán permanentemente del sistema.",
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
        confirmButtonColor: "#8b1b1b",
        confirmButtonText: "Aceptar",
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
        <div class="flex flex-col items-center gap-4 py-4 font-sans">
          <div class="animate-spin h-10 w-10 border-4 border-cip-red border-t-transparent rounded-full"></div>
          <p class="text-gray-600 font-medium">Generando reporte Excel final...</p>
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

  const StatCard = ({ label, value, color, icon, borderAccent }: { label: string; value: number; color: string; icon: string; borderAccent: string }) => (
    <div className={`bg-white rounded-2xl shadow-md border-t-4 ${borderAccent} border-x border-b border-gray-100 p-5 flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color} shadow-inner`}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 font-display">{value}</p>
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 font-display mt-0.5">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 via-gray-50 to-gray-100/30">
      <header className="bg-cip-red text-white py-6 px-4 shadow-xl border-b-4 border-cip-gold relative overflow-hidden">
        {/* Glowing background details */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.12),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-full p-1.5 shadow-sm">
              <img
                src="https://www.ciptacna.org.pe/web/wp-content/uploads/2020/09/cropped-Logo-de-cabecera-de-la-pagina-web-ultimo-1.png"
                alt="CIP Tacna Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-black font-display tracking-wide uppercase">Panel de Administración</h1>
              <p className="text-[10px] text-cip-gold uppercase font-bold tracking-widest font-display">Gestión de Asistencia</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-cip-gold-light hover:text-white text-xs uppercase tracking-widest font-bold border border-white/20 rounded-xl px-4 py-2 hover:bg-white/10 transition-all font-display"
          >
            ← Volver al check-in
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6 mt-6 pb-16">
        {/* ===== DASHBOARD STATS ===== */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cip-gold via-yellow-400 to-cip-gold" />
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-800 font-display uppercase tracking-wide">Métricas del Evento</h2>
              <p className="text-xs text-gray-400 font-medium">Control de comensales en tiempo real</p>
            </div>
            <button
              onClick={loadStats}
              disabled={loadingStats}
              className="text-xs text-cip-red hover:text-cip-red-hover flex items-center gap-1.5 transition-colors font-bold uppercase tracking-widest cursor-pointer border border-red-100 rounded-lg px-3 py-1.5 bg-red-50/50"
            >
              <svg className={`w-3.5 h-3.5 ${loadingStats ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>

          {loadingStats && !stats ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-cip-red border-t-transparent rounded-full"></div>
            </div>
          ) : !stats || stats.total === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-3">📊</p>
              <h3 className="font-bold text-gray-800 text-lg font-display uppercase">No hay datos en sistema</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">Para comenzar, subí el Excel del evento con las hojas REGISTROS y COMPRADOS.</p>
            </div>
          ) : (
            <>
              {/* Main counters */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Tickets" value={stats.total} color="bg-amber-50" icon="🎫" borderAccent="border-t-cip-gold" />
                <StatCard label="Asistieron" value={stats.attended} color="bg-emerald-50" icon="✅" borderAccent="border-t-emerald-500" />
                <StatCard label="Pendientes" value={stats.pending} color="bg-blue-50" icon="⏳" borderAccent="border-t-blue-500" />
                <StatCard label="Sin Plato Elegido" value={stats.byDish.sinPlato} color="bg-red-50" icon="❓" borderAccent="border-t-cip-red" />
              </div>

              {/* Secondary stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* By dish */}
                <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100/50">
                  <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold font-display mb-4">Distribución de Almuerzos</h3>
                  <div className="space-y-4">
                    <Bar label="Pollo 🍗" value={stats.byDish.pollo} total={stats.total} color="bg-orange-500" />
                    {stats.byDish.chancho > 0 && <Bar label="Chancho 🐷" value={stats.byDish.chancho} total={stats.total} color="bg-red-500" />}
                    {stats.byDish.sinPlato > 0 && <Bar label="Sin plato asignado" value={stats.byDish.sinPlato} total={stats.total} color="bg-gray-400" />}
                  </div>
                </div>

                {/* By source */}
                <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100/50 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold font-display mb-4">Origen de Registros</h3>
                    <div className="space-y-4">
                      <Bar label="REGISTROS (Gratis/Pre-colegiado)" value={stats.bySource.registros} total={stats.total} color="bg-cip-red" />
                      <Bar label="COMPRADOS" value={stats.bySource.comprados} total={stats.total} color="bg-teal-500" />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-4 text-xs font-semibold text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cip-red inline-block"></span> Gratis</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-teal-500 inline-block"></span> Comprados</span>
                  </div>
                </div>

                {/* Attendance rate */}
                <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100/50 col-span-1 md:col-span-2">
                  <h3 className="text-xs text-gray-400 uppercase tracking-widest font-bold font-display mb-3">Tasa de Asistencia</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.total > 0 ? (stats.attended / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xl font-black text-gray-700 min-w-[70px] text-right font-display">
                      {stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 mt-2">
                    <span className="text-emerald-600">✅ {stats.attended} asistieron</span>
                    <span className="text-gray-400">⏳ {stats.pending} por llegar</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ===== CONFIG / MANAGEMENT ===== */}
        <section className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cip-gold via-yellow-400 to-cip-gold" />
          
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 font-display uppercase tracking-wide">
            <span>⚙️</span> Acciones de Configuración
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upload */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">📤</div>
                <h3 className="font-bold text-gray-800 mb-1 font-display text-sm uppercase tracking-wide">Subir Base de Datos</h3>
                <p className="text-xs text-gray-400 mb-4">Cargar Excel oficial con pestañas REGISTROS y COMPRADOS.</p>
              </div>
              <form ref={formRef} action={uploadAction} className="space-y-3">
                <input
                  type="file"
                  name="file"
                  accept=".xlsx,.xls"
                  required
                  disabled={isUploading}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-cip-red file:text-white file:font-bold hover:file:bg-cip-red-hover file:cursor-pointer file:transition-all cursor-pointer font-display file:uppercase file:tracking-wider file:text-[10px] bg-white border border-gray-200 rounded-xl p-1 shadow-sm"
                />
                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full bg-cip-red hover:bg-cip-red-hover active:scale-[0.98] disabled:bg-cip-red/50 text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed text-xs uppercase tracking-widest font-display shadow-md hover:shadow-cip-red/10"
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
                    "Importar Archivo"
                  )}
                </button>
              </form>
            </div>

            {/* Clear */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">🗑️</div>
                <h3 className="font-bold text-gray-800 mb-1 font-display text-sm uppercase tracking-wide">Vaciar Sistema</h3>
                <p className="text-xs text-gray-400 mb-4">Elimina todos los colegiados y registros cargados.</p>
              </div>
              <button
                onClick={handleClear}
                className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs uppercase tracking-widest font-display shadow-md hover:shadow-red-600/10 mt-4"
              >
                Eliminar todo
              </button>
            </div>

            {/* Export */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-3">📥</div>
                <h3 className="font-bold text-gray-800 mb-1 font-display text-sm uppercase tracking-wide">Descargar Resultados</h3>
                <p className="text-xs text-gray-400 mb-4">Exportar Excel consolidado con plato elegido y hora de entrada.</p>
              </div>
              <button
                onClick={handleExport}
                className="w-full bg-cip-red hover:bg-cip-red-hover active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer text-xs uppercase tracking-widest font-display shadow-md hover:shadow-cip-red/10 mt-4"
              >
                Exportar Excel
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium">
        <p className="uppercase tracking-wider font-display text-gray-500 font-bold">CIP - CD Tacna</p>
      </footer>
    </div>
  );
}

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-bold font-mono">{value}</span>
      </div>
      <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
