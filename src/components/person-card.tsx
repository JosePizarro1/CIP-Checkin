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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative animate-fadeIn">
      {/* Decorative gold line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cip-gold via-yellow-400 to-cip-gold" />
      
      {/* Header with ticket number */}
      <div className="bg-cip-red text-white pt-8 pb-6 px-6 text-center relative">
        <p className="text-xs uppercase tracking-widest font-bold text-cip-gold/90 font-display">
          Ticket de Invitación
        </p>
        <p className="text-4xl font-black tracking-wider mt-1 font-display">
          Nº {registration.ticketNumber}
        </p>
        
        {/* Ticket side cutouts */}
        <div className="absolute -left-3 bottom-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)]" />
        <div className="absolute -right-3 bottom-0 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 shadow-[inset_2px_0_4px_rgba(0,0,0,0.02)]" />
      </div>

      {/* Person data */}
      <div className="p-6 space-y-4 border-b border-dashed border-gray-100">
        <div className="grid grid-cols-2 gap-4">
          <DataRow label="CIP" value={registration.cip} valueClass="font-bold text-cip-red text-lg" />
          <DataRow label="CAPÍTULO" value={registration.chapter} />
        </div>
        
        <DataRow
          label="Apellidos, Nombres"
          value={
            registration.lastName
              ? `${registration.lastName}, ${registration.firstName}`
              : "—"
          }
          valueClass="text-gray-900 font-bold text-lg"
        />

        {registration.specialty && (
          <DataRow label="ESPECIALIDAD" value={registration.specialty} />
        )}
        
        <div className="grid grid-cols-2 gap-4">
          {registration.phone && (
            <DataRow label="TELÉFONO" value={registration.phone} />
          )}
          <DataRow
            label="PLATO ELEGIDO"
            value={registration.dish || "Pendiente de selección"}
            valueClass={!registration.dish ? "text-red-500 font-bold" : "text-green-600 font-bold"}
          />
        </div>

        {registration.purchaseDate && (
          <DataRow
            label="FECHA DE COMPRA / REGISTRO"
            value={formatDateTime(registration.purchaseDate)}
          />
        )}
      </div>

      {/* Dish selection (only if no dish assigned and not already attended) */}
      {needsDish && !registration.attended && (
        <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100">
          <p className="font-bold text-gray-700 mb-3 flex items-center gap-2 font-display text-sm uppercase tracking-wider">
            <span className="text-cip-gold text-lg">⚠️</span>
            Seleccionar almuerzo obligatoriamente:
          </p>
          <div className="flex gap-4">
            <label
              className={`flex-1 flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-95 ${
                selectedDish === "Pollo"
                  ? "border-cip-gold bg-cip-gold-light/40 shadow-md scale-[1.02]"
                  : "border-gray-200 bg-white hover:border-cip-red/30 hover:shadow-sm"
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
              <span className="text-3xl">🍗</span>
              <span className="font-bold text-gray-800 text-base font-display">Pollo</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase">Almuerzo</span>
            </label>
            <label
              className={`flex-1 flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-95 ${
                selectedDish === "Chancho"
                  ? "border-cip-gold bg-cip-gold-light/40 shadow-md scale-[1.02]"
                  : "border-gray-200 bg-white hover:border-cip-red/30 hover:shadow-sm"
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
              <span className="text-3xl">🐷</span>
              <span className="font-bold text-gray-800 text-base font-display">Chancho</span>
              <span className="text-[10px] text-gray-400 font-medium uppercase">Almuerzo</span>
            </label>
          </div>
        </div>
      )}

      {/* Action area */}
      <div className="p-6 space-y-4">
        {registration.attended ? (
          <div className="text-center p-5 bg-green-50 rounded-2xl border border-green-200 animate-fadeIn">
            <p className="text-green-700 text-xl font-bold flex items-center justify-center gap-2 font-display">
              <span>✓</span> ASISTENCIA REGISTRADA
            </p>
            {registration.checkinTime && (
              <p className="text-green-600 text-xs mt-1.5 uppercase font-medium tracking-wide">
                Ingreso: {formatDateTime(registration.checkinTime)}
              </p>
            )}
          </div>
        ) : (
          <>
            {needsDish && !selectedDish ? (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-center animate-fadeIn">
                <p className="text-red-500 text-sm font-semibold">
                  Debés seleccionar una opción de plato para continuar
                </p>
              </div>
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
          className="w-full text-gray-400 hover:text-cip-red text-xs uppercase tracking-widest font-bold py-2.5 transition-colors cursor-pointer font-display text-center"
        >
          ← Volver a buscar ticket
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
