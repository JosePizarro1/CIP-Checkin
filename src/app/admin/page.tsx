"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { uploadExcel, clearAll } from "@/lib/actions";
import type { UploadResult } from "@/lib/types";

export default function AdminPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const [uploadState, uploadAction, isUploading] = useActionState(
    async (
      _prev: UploadResult | null,
      formData: FormData
    ): Promise<UploadResult | null> => {
      return await uploadExcel(formData);
    },
    null
  );

  // Show SweetAlert when upload finishes
  useEffect(() => {
    if (!uploadState) return;
    if (uploadState.success) {
      Swal.fire({
        icon: "success",
        title: "Importación completada",
        html: `
          <p class="text-lg font-semibold text-green-700 mb-2">✅ Datos importados correctamente</p>
          <div class="text-gray-600 space-y-1">
            <p>📥 <strong>${uploadState.counts.inserted}</strong> registros nuevos</p>
            <p>🔄 <strong>${uploadState.counts.updated}</strong> actualizados</p>
          </div>
          ${uploadState.errors.length > 0 ? `<div class="mt-3 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-700">⚠️ ${uploadState.errors.length} error(es) menores</div>` : ""}
        `,
        confirmButtonColor: "#1e3a5f",
        confirmButtonText: "OK",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error al importar",
        text: uploadState.errors.join(", ") || "Ocurrió un error desconocido",
        confirmButtonColor: "#dc2626",
        confirmButtonText: "Cerrar",
      });
    }
  }, [uploadState]);

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
        // Create a hidden link to trigger download
        const link = document.createElement("a");
        link.href = "/api/export";
        link.click();
        // Close swal after a short delay
        setTimeout(() => Swal.close(), 1500);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white py-6 px-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">
          Panel de Administración
        </h1>
        <Link
          href="/"
          className="text-blue-200 text-sm underline mt-2 block text-center hover:text-blue-100"
        >
          ← Volver al check-in
        </Link>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6 mt-8 pb-16">
        {/* Section 1: Upload Excel */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Subir Excel
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Importar datos desde el archivo de registro del evento.
          </p>
          <form ref={formRef} action={uploadAction} className="space-y-4">
            <input
              type="file"
              name="file"
              accept=".xlsx,.xls"
              required
              disabled={isUploading}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-blue-900 file:text-white file:font-medium hover:file:bg-blue-800 file:cursor-pointer file:transition-colors cursor-pointer"
            />
            <button
              type="submit"
              disabled={isUploading}
              className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
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
        </section>

        {/* Section 2: Clear Data */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Limpiar Datos
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Eliminar todos los registros de la base de datos.
          </p>
          <button
            onClick={handleClear}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer"
          >
            Eliminar todos los datos
          </button>
        </section>

        {/* Section 3: Export */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Exportar Resultados
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Descargar un archivo Excel con todos los registros y el estado de
            check-in.
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl text-center transition-colors cursor-pointer"
          >
            Descargar Excel
          </button>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-400">
        <p>CIP - Colegio de Ingenieros del Perú</p>
      </footer>
    </div>
  );
}
