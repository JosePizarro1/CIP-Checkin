"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import SearchForm from "@/components/search-form";
import PersonCard from "@/components/person-card";
import type { Registration, SearchResult } from "@/lib/types";

export default function Home() {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearchResult = useCallback((result: SearchResult) => {
    if (result.success && result.data) {
      setRegistration(result.data);
      setError(null);
    } else {
      setRegistration(null);
      setError(result.error || "Error al buscar ticket");
      // Show SweetAlert for not found
      if (result.error?.includes("no encontrado")) {
        Swal.fire({
          icon: "error",
          title: "Ticket no encontrado",
          text: result.error,
          confirmButtonColor: "#1e3a5f",
          confirmButtonText: "Reintentar",
          timer: 4000,
          timerProgressBar: true,
        });
      }
    }
  }, []);

  const handleConfirmSuccess = useCallback(
    (updated: Registration) => {
      setRegistration(null);
      Swal.fire({
        icon: "success",
        title: "¡Asistencia Confirmada!",
        html: `
          <div class="text-center space-y-3 py-2">
            <div class="text-6xl">✅</div>
            <p class="text-lg font-bold text-green-700">Ticket #${updated.ticketNumber}</p>
            <div class="text-gray-600 space-y-1">
              ${updated.lastName ? `<p>${updated.lastName}, ${updated.firstName}</p>` : ""}
              ${updated.dish ? `<p>🍽️ Plato: <strong>${updated.dish}</strong></p>` : ""}
            </div>
            <p class="text-sm text-green-600">${new Date().toLocaleString("es-PE")}</p>
          </div>
        `,
        confirmButtonColor: "#1e3a5f",
        confirmButtonText: "Buscar otro ticket",
        allowOutsideClick: false,
      });
    },
    []
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      <header className="bg-blue-900 text-white py-6 px-4 shadow-lg">
        <h1 className="text-2xl font-bold text-center">CIP Check-in</h1>
        <p className="text-blue-200 text-sm text-center mt-1">
          Almuerzo Ingeniero&apos;s Day
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-4 pt-16">
        <div className="w-full max-w-lg">
          {!registration ? (
            <>
              <SearchForm onResult={handleSearchResult} />
              {error && !error.includes("no encontrado") && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center animate-fadeIn">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}
            </>
          ) : (
            <PersonCard
              registration={registration}
              onConfirmSuccess={handleConfirmSuccess}
              onBack={() => setRegistration(null)}
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        <p>CIP - Colegio de Ingenieros del Perú</p>
        <Link
          href="/admin"
          className="text-xs text-gray-400 hover:text-gray-600 underline mt-1 inline-block"
        >
          Administración
        </Link>
      </footer>
    </div>
  );
}
