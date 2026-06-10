"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { uploadExcel, clearAll } from "@/lib/actions";
import type { UploadResult } from "@/lib/types";

export default function AdminPage() {
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const [uploadState, uploadAction, isUploading] = useActionState(
    async (
      _prev: UploadResult | null,
      formData: FormData
    ): Promise<UploadResult | null> => {
      return await uploadExcel(formData);
    },
    null
  );

  const handleClear = async () => {
    if (
      !window.confirm(
        "¿Está seguro de eliminar todos los datos? Esta acción no se puede deshacer."
      )
    )
      return;
    const result = await clearAll();
    setClearMessage(
      result.success
        ? "Todos los datos han sido eliminados correctamente."
        : "Error al eliminar los datos."
    );
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
          <form action={uploadAction} className="space-y-4">
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
              {isUploading ? "Subiendo..." : "Importar Excel"}
            </button>
          </form>
          {uploadState && (
            <div className="mt-4 space-y-2">
              {uploadState.success && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-medium">
                    Importación completada
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    {uploadState.counts.inserted} registros importados,{" "}
                    {uploadState.counts.updated} actualizados
                  </p>
                </div>
              )}
              {uploadState.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-700 font-medium">Errores:</p>
                  <ul className="text-red-600 text-sm list-disc list-inside mt-1">
                    {uploadState.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
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
          {clearMessage && (
            <p
              className={`mt-3 text-sm text-center font-medium ${
                clearMessage.includes("Error")
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {clearMessage}
            </p>
          )}
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
          <a
            href="/api/export"
            className="block w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-xl text-center transition-colors"
          >
            Descargar Excel
          </a>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-400">
        <p>CIP - Colegio de Ingenieros del Perú</p>
      </footer>
    </div>
  );
}
