"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import SearchForm from "@/components/search-form";
import PersonCard from "@/components/person-card";
import type { Registration, SearchResult } from "@/lib/types";
import { Lock } from "lucide-react";

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
          confirmButtonColor: "#8b1b1b",
          confirmButtonText: "Entendido",
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
          <div class="text-center space-y-4 py-2 font-sans">
            <div class="flex justify-center">
              <div class="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle-2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
            </div>
            <p class="text-2xl font-black text-emerald-600 font-display">TICKET Nº ${updated.ticketNumber}</p>
            <div class="inline-block bg-gray-50 border border-gray-100 rounded-2xl p-4 w-full text-center">
              ${updated.lastName ? `<p class="text-lg font-bold text-gray-800">${updated.lastName}, ${updated.firstName}</p>` : ""}
              ${updated.cip ? `<p class="text-sm text-gray-500 font-mono mt-1">CIP: ${updated.cip}</p>` : ""}
              ${updated.dish ? `<p class="text-base font-bold text-cip-red mt-2">Almuerzo: ${updated.dish}</p>` : ""}
            </div>
            <p class="text-xs text-gray-400 font-medium uppercase">${new Date().toLocaleString("es-PE")}</p>
          </div>
        `,
        confirmButtonColor: "#8b1b1b",
        confirmButtonText: "Buscar otro ticket",
        allowOutsideClick: false,
      });
    },
    []
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-red-50/40 via-gray-50/50 to-gray-100/30">
      <header className="bg-cip-red text-white py-6 px-4 shadow-xl border-b-4 border-cip-gold relative overflow-hidden">
        {/* Abstract glowing effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="max-w-lg mx-auto flex flex-col items-center gap-3">
          {/* Logo container */}
          <div className="bg-white rounded-full p-2.5 shadow-md border border-cip-gold/20 flex items-center justify-center">
            <img
              src="https://www.ciptacna.org.pe/web/wp-content/uploads/2020/09/cropped-Logo-de-cabecera-de-la-pagina-web-ultimo-1.png"
              alt="Logo CIP Tacna"
              className="h-16 w-auto object-contain"
            />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-black font-display tracking-wide uppercase">
              CIP Check-in
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cip-gold animate-ping" />
              <p className="text-cip-gold font-bold text-xs uppercase tracking-widest font-display">
                Almuerzo Día del Ingeniero
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-4 pt-12 md:pt-16">
        <div className="w-full max-w-lg">
          {!registration ? (
            <>
              <SearchForm onResult={handleSearchResult} />
              {error && !error.includes("no encontrado") && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-center animate-fadeIn shadow-sm">
                  <p className="text-red-600 font-bold text-sm font-display">{error}</p>
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

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium">
        <div className="max-w-lg mx-auto space-y-2">
          <p className="uppercase tracking-wider font-display text-gray-500 font-bold">
            CIP - Consejo Departamental de Tacna
          </p>
          <p className="text-[10px] text-gray-400">
            © {new Date().getFullYear()} — Gestión 2025-2027
          </p>
          <div className="pt-2">
            <Link
              href="/admin"
              className="text-gray-400 hover:text-cip-red hover:underline transition-colors uppercase tracking-widest text-[10px] font-bold border border-gray-200 hover:border-cip-red/30 rounded-lg px-3.5 py-2 inline-flex items-center gap-1.5 bg-gray-50/50"
            >
              <Lock className="h-3.5 w-3.5 text-gray-450" />
              Administración
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
