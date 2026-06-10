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
    <div className="flex flex-col items-center">
      {/* Lanyard connection slot representation */}
      <div className="w-16 h-4 bg-gray-300 rounded-full mb-[-8px] z-10 flex items-center justify-center border border-gray-400/30">
        <div className="w-8 h-1.5 bg-gray-600 rounded-full"></div>
      </div>

      {/* The Carnet / Credential Body */}
      <div className="w-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Background Decorative Shapes */}
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-blue-900/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-40 h-40 bg-yellow-500/10 rounded-full blur-2xl"></div>

        {/* Credential Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 text-center border-b border-yellow-500/20 relative">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-500">
            Colegio de Ingenieros del Perú
          </p>
          <p className="text-sm font-semibold tracking-wide text-blue-200 mt-0.5">
            Día del Ingeniero — Almuerzo Oficial
          </p>
          <span className="absolute bottom-0 right-4 translate-y-1/2 bg-yellow-500 text-blue-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            {registration.source}
          </span>
        </div>

        {/* Badge Avatar & Ticket Info */}
        <div className="p-6 pt-8 flex flex-col items-center">
          {/* Mock Avatar */}
          <div className="w-24 h-24 bg-gradient-to-tr from-gray-100 to-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-lg relative mb-4">
            <span className="text-4xl">👨‍💻</span>
            {registration.attended && (
              <span className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full text-xs shadow-md border-2 border-white">
                ✓
              </span>
            )}
          </div>

          {/* CIP and Ticket Numbers */}
          <div className="text-center mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nro Colegiatura</span>
            <p className="text-2xl font-black text-blue-950 leading-none mt-1">
              CIP: {registration.cip || "SIN CIP"}
            </p>
          </div>

          {/* Member Credentials */}
          <div className="w-full bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
            <div className="text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nombre Completo</span>
              <p className="text-lg font-bold text-gray-800 uppercase mt-0.5 leading-snug">
                {registration.lastName
                  ? `${registration.lastName}, ${registration.firstName}`
                  : "Colegiado Comprado"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Capítulo</span>
                <p className="text-xs font-bold text-gray-700 truncate mt-0.5">
                  {registration.chapter || "—"}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Especialidad</span>
                <p className="text-xs font-bold text-gray-700 truncate mt-0.5">
                  {registration.specialty || "—"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-3">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Plato</span>
                <p className="text-sm font-black text-gray-800 mt-0.5 flex items-center gap-1.5">
                  {registration.dish ? (
                    <>
                      <span>{registration.dish === "Pollo" ? "🍗" : "🐷"}</span>
                      <span className="text-blue-900">{registration.dish}</span>
                    </>
                  ) : (
                    <span className="text-red-500">No seleccionado</span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Nro Ticket</span>
                <p className="text-sm font-black text-blue-950 mt-0.5">
                  #{registration.ticketNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dish selection (only if no dish assigned and not already attended) */}
        {needsDish && !registration.attended && (
          <div className="px-6 pb-6">
            <p className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
              <span className="text-yellow-500 text-lg">⚠️</span>
              Seleccionar plato para continuar:
            </p>
            <div className="flex gap-4">
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedDish === "Pollo"
                    ? "border-blue-600 bg-blue-50 shadow-md scale-[1.02]"
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
                <span className="font-bold text-base text-gray-800">Pollo</span>
              </label>
              <label
                className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedDish === "Chancho"
                    ? "border-blue-600 bg-blue-50 shadow-md scale-[1.02]"
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
                <span className="font-bold text-base text-gray-800">Chancho</span>
              </label>
            </div>
          </div>
        )}

        {/* Action area */}
        <div className="p-6 pt-0 space-y-3">
          {registration.attended ? (
            <div className="text-center p-4 bg-green-50 rounded-2xl border-2 border-dashed border-green-300 relative overflow-hidden">
              <p className="text-green-700 text-xl font-black uppercase tracking-wider">
                ✓ ASISTENCIA REGISTRADA
              </p>
              {registration.checkinTime && (
                <p className="text-green-600 text-xs font-semibold mt-1">
                  Ingreso: {formatDateTime(registration.checkinTime)}
                </p>
              )}
            </div>
          ) : (
            <>
              {needsDish && !selectedDish ? (
                <p className="text-red-500 text-xs font-bold text-center">
                  ⚠️ Por favor, seleccione un plato para habilitar el ingreso.
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
            className="w-full text-gray-400 hover:text-blue-900 text-xs font-bold py-2 transition-colors cursor-pointer text-center block mt-2"
          >
            ← Volver a buscar ticket
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
