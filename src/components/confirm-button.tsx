"use client";

import { useActionState, useEffect } from "react";
import Swal from "sweetalert2";
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

  // Show SweetAlert on error
  useEffect(() => {
    if (state && !state.success) {
      Swal.fire({
        icon: "error",
        title: "Error al confirmar",
        text: state.message,
        confirmButtonColor: "#dc2626",
        confirmButtonText: "Cerrar",
      });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white text-xl font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin h-6 w-6"
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
  );
}
