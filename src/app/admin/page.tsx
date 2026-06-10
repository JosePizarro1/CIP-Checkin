"use client";

import { useActionState, useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { uploadExcel, clearAll, getStats, getAllRegistrations } from "@/lib/actions";
import type { UploadResult, DashboardStats, Registration } from "@/lib/types";
import { 
  Ticket, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  X, 
  Search, 
  Trash2, 
  Download, 
  RefreshCw, 
  Upload, 
  FileSpreadsheet, 
  Utensils 
} from "lucide-react";

export default function AdminPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Modal State
  const [activeModalFilter, setActiveModalFilter] = useState<string | null>(null); // "total" | "attended" | "pending" | "sinPlato" | null
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  // Load stats on mount
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    const data = await getStats();
    setStats(data);
    
    // Fetch all registrations for detail modal
    const list = await getAllRegistrations();
    setAllRegistrations(list);
    
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
            <div class="flex justify-center">
              <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-spreadsheet"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M8 13h8"/><path d="M8 17h8"/><path d="M10 9h2"/></svg>
              </div>
            </div>
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
    const { value: typedPassword } = await Swal.fire({
      title: "¿Eliminar todos los datos?",
      text: "Esta acción borrará permanentemente todos los colegiados del sistema. Por favor, ingresá la contraseña de administrador para continuar:",
      input: "password",
      inputPlaceholder: "Contraseña",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar todo",
      cancelButtonText: "Cancelar",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off"
      }
    });

    if (typedPassword === undefined) return; // Action cancelled

    const expectedPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "cip";
    if (typedPassword !== expectedPass) {
      await Swal.fire({
        icon: "error",
        title: "Contraseña incorrecta",
        text: "La contraseña ingresada no es correcta. No se han eliminado los registros.",
        confirmButtonColor: "#8b1b1b"
      });
      return;
    }

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

  // Filter logic for detail view
  const getFilteredRegistrations = () => {
    let list = allRegistrations;
    if (activeModalFilter === "attended") {
      list = allRegistrations.filter((r) => r.attended);
    } else if (activeModalFilter === "pending") {
      list = allRegistrations.filter((r) => !r.attended);
    } else if (activeModalFilter === "sinPlato") {
      list = allRegistrations.filter((r) => !r.dish);
    }
    
    // Apply search query
    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase();
      list = list.filter((r) => 
        r.ticketNumber.toLowerCase().includes(q) ||
        (r.cip || "").toLowerCase().includes(q) ||
        (r.lastName || "").toLowerCase().includes(q) ||
        (r.firstName || "").toLowerCase().includes(q) ||
        (r.chapter || "").toLowerCase().includes(q) ||
        (r.specialty || "").toLowerCase().includes(q)
      );
    }
    return list;
  };

  const getModalTitle = () => {
    switch (activeModalFilter) {
      case "total": return "Total de Tickets Cargados";
      case "attended": return "Colegiados que Asistieron";
      case "pending": return "Colegiados Pendientes (Faltan)";
      case "sinPlato": return "Colegiados Sin Plato Elegido";
      default: return "";
    }
  };

  const StatCard = ({ 
    label, 
    value, 
    color, 
    icon: Icon, 
    borderAccent, 
    onClick 
  }: { 
    label: string; 
    value: number; 
    color: string; 
    icon: React.ComponentType<{ className?: string }>; 
    borderAccent: string;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left bg-white rounded-2xl shadow-md border-t-4 ${borderAccent} border-x border-b border-gray-100 p-5 flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${color} shadow-inner shrink-0 text-gray-700`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 font-display leading-none">{value}</p>
        <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 font-display mt-1.5">{label}</p>
      </div>
    </button>
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
              <p className="text-xs text-gray-400 font-medium">Hacé clic en las tarjetas para ver el listado de personas y buscar</p>
            </div>
            <button
              onClick={loadStats}
              disabled={loadingStats}
              className="text-xs text-cip-red hover:text-cip-red-hover flex items-center gap-1.5 transition-colors font-bold uppercase tracking-widest cursor-pointer border border-red-100 rounded-lg px-3 py-1.5 bg-red-50/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>

          {loadingStats && !stats ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-cip-red border-t-transparent rounded-full"></div>
            </div>
          ) : !stats || stats.total === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="h-14 w-14 mx-auto text-gray-300 mb-3 animate-pulse" />
              <h3 className="font-bold text-gray-800 text-lg font-display uppercase">No hay datos en sistema</h3>
              <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">Para comenzar, subí el Excel del evento con las hojas REGISTROS y COMPRADOS.</p>
            </div>
          ) : (
            <>
              {/* Main counters (Clickable) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard 
                  label="Total Tickets" 
                  value={stats.total} 
                  color="bg-amber-50" 
                  icon={Ticket} 
                  borderAccent="border-t-cip-gold" 
                  onClick={() => setActiveModalFilter("total")}
                />
                <StatCard 
                  label="Asistieron" 
                  value={stats.attended} 
                  color="bg-emerald-50" 
                  icon={CheckCircle} 
                  borderAccent="border-t-emerald-500" 
                  onClick={() => setActiveModalFilter("attended")}
                />
                <StatCard 
                  label="Pendientes" 
                  value={stats.pending} 
                  color="bg-blue-50" 
                  icon={Clock} 
                  borderAccent="border-t-blue-500" 
                  onClick={() => setActiveModalFilter("pending")}
                />
                <StatCard 
                  label="Sin Plato Elegido" 
                  value={stats.byDish.sinPlato} 
                  color="bg-red-50" 
                  icon={AlertCircle} 
                  borderAccent="border-t-cip-red" 
                  onClick={() => setActiveModalFilter("sinPlato")}
                />
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
            <Utensils className="h-5 w-5 text-cip-red" /> Acciones de Configuración
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upload */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="text-cip-red mb-3">
                  <Upload className="h-8 w-8" />
                </div>
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
                      <RefreshCw className="animate-spin h-4 w-4" />
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
                <div className="text-red-600 mb-3">
                  <Trash2 className="h-8 w-8" />
                </div>
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
                <div className="text-cip-red mb-3">
                  <FileSpreadsheet className="h-8 w-8" />
                </div>
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

      {/* ===== DETAIL MODAL WITH SEARCH ===== */}
      {activeModalFilter && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden relative border border-gray-100">
            {/* Top gold bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cip-gold via-yellow-400 to-cip-gold z-20" />
            
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between mt-1">
              <div>
                <h3 className="text-lg font-black text-gray-900 font-display uppercase tracking-wide">
                  {getModalTitle()}
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  {getFilteredRegistrations().length} registros encontrados
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveModalFilter(null);
                  setModalSearchQuery("");
                }}
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search Input bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="relative max-w-md">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Buscar por Ticket, CIP, Apellido o Capítulo..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-cip-gold focus:outline-none focus:ring-4 focus:ring-cip-gold/20 transition-all text-sm font-medium"
                />
              </div>
            </div>
            
            {/* Modal Content - List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {getFilteredRegistrations().length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p className="font-bold text-gray-800 font-display uppercase">Sin resultados</p>
                  <p className="text-xs text-gray-400 mt-1">Intentá con otra palabra clave de búsqueda o filtro.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredRegistrations().map((reg) => (
                    <div 
                      key={reg.id} 
                      className="bg-gray-50/50 hover:bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-cip-red/10 text-cip-red font-bold font-display px-2 py-0.5 rounded-lg text-xs">
                            Ticket #{reg.ticketNumber}
                          </span>
                          {reg.cip && (
                            <span className="bg-gray-200/70 text-gray-600 font-bold font-mono px-2 py-0.5 rounded-lg text-xs">
                              CIP: {reg.cip}
                            </span>
                          )}
                          <span className="bg-cip-gold/20 text-yellow-800 font-bold text-[9px] uppercase px-2 py-0.5 rounded-full font-display">
                            {reg.source}
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-900 mt-2 truncate text-base leading-tight">
                          {reg.lastName ? `${reg.lastName}, ${reg.firstName}` : "Colegiado Pre-registrado"}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {reg.chapter || "—"} {reg.specialty ? `• ${reg.specialty}` : ""}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider font-display">Plato</p>
                          <p className={`text-sm font-extrabold mt-0.5 ${reg.dish ? "text-emerald-600" : "text-red-500"}`}>
                            {reg.dish || "No elegido"}
                          </p>
                        </div>
                        
                        <div className="border-l border-gray-200 pl-3">
                          {reg.attended ? (
                            <span className="bg-emerald-500 text-white p-1 rounded-full block text-xs shadow-sm">
                              <CheckCircle className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-500 p-1.5 rounded-full block text-xs border border-amber-200">
                              <Clock className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
