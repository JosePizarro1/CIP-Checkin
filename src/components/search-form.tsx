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
      <div className="flex flex-col gap-4">
        <label
          htmlFor="ticket"
          className="text-lg font-semibold text-center text-blue-900"
        >
          Número de Ticket
        </label>
        <input
          id="ticket"
          name="ticket"
          type="text"
          inputMode="numeric"
          autoFocus
          placeholder="Ingrese su número de ticket"
          className="w-full text-center text-2xl py-4 px-6 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
          required
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-400 text-white text-xl font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
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
          <p className="text-red-600 text-center font-medium">{state.error}</p>
        )}
      </div>
    </form>
  );
}
