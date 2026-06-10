"use client";

import { useActionState } from "react";
import { confirmCheckin } from "@/lib/actions";
import type { CheckinResult } from "@/lib/types";

interface ConfirmButtonProps {
  ticketNumber: string;
  dish?: string;
  onSuccess: () => void;
}

export default function ConfirmButton({
  ticketNumber,
  dish,
  onSuccess,
}: ConfirmButtonProps) {
  const [state, formAction, isPending] = useActionState(
    async (
      _prev: CheckinResult | null,
      formData: FormData
    ): Promise<CheckinResult | null> => {
      const result = await confirmCheckin(ticketNumber, dish);
      if (result.success && onSuccess) {
        onSuccess();
      }
      return result;
    },
    null
  );

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white text-xl font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
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
              Confirmando...
            </>
          ) : (
            "Confirmar Asistencia"
          )}
        </button>
      </form>
      {state && !state.success && (
        <p className="mt-2 text-red-600 text-center font-medium">
          {state.message}
        </p>
      )}
      {state && state.success && (
        <p className="mt-2 text-green-600 text-center font-bold text-lg">
          ✓ Asistencia confirmada
        </p>
      )}
    </div>
  );
}
