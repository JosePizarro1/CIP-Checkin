"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import SearchForm from "@/components/search-form";
import PersonCard from "@/components/person-card";
import type { Registration, SearchResult } from "@/lib/types";

export default function Home() {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Registration | null>(null);

  const handleSearchResult = useCallback((result: SearchResult) => {
    if (result.success && result.data) {
      setRegistration(result.data);
      setError(null);
      setConfirmed(null);
    } else {
      setRegistration(null);
      setError(result.error || "Error al buscar ticket");
      setConfirmed(null);
    }
  }, []);

  const handleConfirmSuccess = useCallback(
    (updated: Registration) => {
      setConfirmed(updated);
    },
    []
  );

  const handleReset = useCallback(() => {
    setRegistration(null);
    setError(null);
    setConfirmed(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white py-6 px-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">CIP Check-in</h1>
        <p className="text-blue-200 text-sm text-center mt-1">
          Almuerzo Ingeniero&apos;s Day
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start p-4 pt-16">
        <div className="w-full max-w-lg">
          {!registration && !confirmed ? (
            <>
              <SearchForm onResult={handleSearchResult} />
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              )}
            </>
          ) : confirmed ? (
            <div className="text-center space-y-6">
              <div className="text-7xl">✅</div>
              <h2 className="text-2xl font-bold text-green-700">
                ¡Asistencia Confirmada!
              </h2>
              <p className="text-lg text-gray-600">
                Ticket: <strong>{confirmed.ticketNumber}</strong>
              </p>
              {confirmed.dish && (
                <p className="text-gray-500">
                  Plato: <strong>{confirmed.dish}</strong>
                </p>
              )}
              <button
                onClick={handleReset}
                className="bg-blue-900 hover:bg-blue-800 text-white text-lg font-bold py-3 px-8 rounded-xl transition-colors cursor-pointer"
              >
                Buscar otro ticket
              </button>
            </div>
          ) : (
            <PersonCard
              registration={registration!}
              onConfirmSuccess={handleConfirmSuccess}
              onBack={handleReset}
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
