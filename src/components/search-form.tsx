"use client";

import { useActionState } from "react";
import { searchTicket } from "@/lib/actions";
import type { SearchResult } from "@/lib/types";

interface SearchFormProps {
  onResult: (result: SearchResult) => void;
}

export default function SearchForm({ onResult }: SearchFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (
      _prev: SearchResult | null,
      formData: FormData
    ): Promise<SearchResult | null> => {
      const ticket = (formData.get("ticket") as string) || "";
      if (ticket.trim().length === 0) {
        const result: SearchResult = {
          success: false,
          error: "Ingrese un número de ticket",
        };
        onResult(result);
        return result;
      }
      const result = await searchTicket(ticket.trim());
      onResult(result);
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6 animate-fadeIn relative overflow-hidden">
        {/* Decorative top gold line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cip-gold via-yellow-400 to-cip-gold" />
        
        <div className="flex flex-col gap-2">
          <label
            htmlFor="ticket"
            className="text-xs uppercase tracking-widest font-bold text-center text-gray-400 font-display"
          >
            Búsqueda de Asistencia
          </label>
          <h2 className="text-xl font-bold text-center text-cip-red font-display">
            NÚMERO DE TICKET
          </h2>
        </div>
        
        <div className="relative">
          <input
            id="ticket"
            name="ticket"
            type="text"
            inputMode="numeric"
            autoFocus
            placeholder="Ej: 1450"
            className="w-full text-center text-3xl font-bold py-4 px-6 rounded-2xl border-2 border-gray-200 focus:border-cip-gold focus:outline-none focus:ring-4 focus:ring-cip-gold/20 transition-all font-display text-cip-red placeholder-gray-300"
            required
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-cip-red hover:bg-cip-red-hover active:scale-[0.98] shadow-lg hover:shadow-cip-red/20 disabled:bg-cip-red/50 text-white text-lg font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed font-display tracking-wider uppercase"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Buscando...
            </>
          ) : (
            "Buscar Ticket"
          )}
        </button>
        {state && !state.success && (
          <p className="text-red-600 text-center font-medium text-sm animate-fadeIn">{state.error}</p>
        )}
      </div>
    </form>
  );
}
