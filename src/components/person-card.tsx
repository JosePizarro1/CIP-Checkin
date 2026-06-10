"use client";

import { useState } from "react";
import ConfirmButton from "@/components/confirm-button";
import type { Registration } from "@/lib/types";

interface PersonCardProps {
  registration: Registration;
  onConfirmSuccess: (updated: Registration) => void;
  onBack: () => void;
}

export default function PersonCard({
  registration,
  onConfirmSuccess,
  onBack,
}: PersonCardProps) {
  const [selectedDish, setSelectedDish] = useState<string>(
    registration.dish || ""
  );
  const needsDish = !registration.dish;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header with ticket number */}
      <div className="bg-blue-900 text-white p-4 text-center">
        <p className="text-xs uppercase tracking-wider opacity-80">
          NRO TICKET
        </p>
        <p className="text-3xl font-bold tracking-wider">
          {registration.ticketNumber}
        </p>
      </div>

      {/* Person data */}
      <div className="p-6 space-y-3">
        <DataRow label="CIP" value={registration.cip} />
        <DataRow
          label="APELLIDOS, NOMBRES"
          value={
            registration.lastName
              ? `${registration.lastName}, ${registration.firstName}`
              : "—"
          }
        />
        {registration.chapter && (
          <DataRow label="CAPÍTULO" value={registration.chapter} />
        )}
        {registration.specialty && (
          <DataRow label="ESPECIALIDAD" value={registration.specialty} />
        )}
        {registration.phone && (
          <DataRow label="TELÉFONO" value={registration.phone} />
        )}
        <DataRow
          label="PLATO"
          value={registration.dish || "No seleccionado"}
          valueClass={!registration.dish ? "text-red-600 font-bold" : ""}
        />
        <DataRow
          label="FECHA Y HORA"
          value={
            registration.purchaseDate
              ? formatDateTime(registration.purchaseDate)
              : "—"
          }
        />
      </div>

      {/* Dish selection (only if no dish assigned and not already attended) */}
        {needsDish && !registration.attended && (
        <div className="px-6 pb-4">
          <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-yellow-500 text-lg">⚠️</span>
            Seleccionar plato:
          </p>
          <div className="flex gap-4">
            <label
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedDish === "Pollo"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
              }`}
            >
              <input
                type="radio"
                name="dish"
                value="Pollo"
                checked={selectedDish === "Pollo"}
                onChange={(e) => setSelectedDish(e.target.value)}
                className="sr-only"
              />
              <span className="text-2xl">🍗</span>
              <span className="font-medium text-lg">Pollo</span>
            </label>
            <label
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedDish === "Chancho"
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
              }`}
            >
              <input
                type="radio"
                name="dish"
                value="Chancho"
                checked={selectedDish === "Chancho"}
                onChange={(e) => setSelectedDish(e.target.value)}
                className="sr-only"
              />
              <span className="text-2xl">🐷</span>
              <span className="font-medium text-lg">Chancho</span>
            </label>
          </div>
        </div>
      )}

      {/* Action area */}
      <div className="p-6 pt-0 space-y-3">
        {registration.attended ? (
          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-green-700 text-xl font-bold">
              ✓ Ya registrado
            </p>
            {registration.checkinTime && (
              <p className="text-green-600 text-sm mt-1">
                Hora: {formatDateTime(registration.checkinTime)}
              </p>
            )}
          </div>
        ) : (
          <>
            {needsDish && !selectedDish ? (
              <p className="text-red-500 text-sm text-center">
                Seleccione un plato para continuar
              </p>
            ) : (
              <ConfirmButton
                ticketNumber={registration.ticketNumber}
                dish={selectedDish || undefined}
                onSuccess={() =>
                  onConfirmSuccess({
                    ...registration,
                    attended: true,
                    checkinTime: new Date(),
                    dish: selectedDish || registration.dish,
                  })
                }
              />
            )}
          </>
        )}

        <button
          onClick={onBack}
          className="w-full text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors cursor-pointer"
        >
          ← Buscar otro ticket
        </button>
      </div>
    </div>
  );
}

function DataRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string | null | undefined;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-base font-medium ${valueClass || "text-gray-800"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
