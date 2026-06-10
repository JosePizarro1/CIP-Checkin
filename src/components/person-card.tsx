"use client";

import { useState } from "react";
import ConfirmButton from "@/components/confirm-button";
import type { Registration } from "@/lib/types";
import { 
  Shield, 
  BookOpen, 
  Briefcase, 
  Phone, 
  Utensils, 
  Hash, 
  Calendar, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  Ticket 
} from "lucide-react";

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
    <div className="w-full max-w-3xl mx-auto animate-fadeIn px-2 md:px-0">
      {/* Horizontal Ticket/Credential Body */}
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden relative flex flex-col md:flex-row min-h-[320px]">
        {/* Decorative gold stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cip-gold via-yellow-400 to-cip-gold z-20" />

        {/* LEFT COLUMN / TICKET STUB */}
        <div className="bg-gradient-to-b from-cip-red to-red-950 text-white p-6 md:p-8 flex flex-col items-center justify-center text-center relative md:w-1/3 border-b-2 md:border-b-0 md:border-r-2 border-dashed border-cip-gold/30">
          {/* Simulated Ticket Punch Holes (visible on desktop) */}
          <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] hidden md:block z-10" />
          <div className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-gray-50 border border-gray-100 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)] hidden md:block z-10" />
          
          <div className="bg-white/10 rounded-2xl p-3 mb-3 text-cip-gold">
            <Ticket className="h-7 w-7" />
          </div>

          <div className="bg-cip-gold/20 text-cip-gold text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase mb-2 font-display">
            {registration.source}
          </div>
          
          <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest font-display">Número Ticket</span>
          <h3 className="text-3xl font-black font-display text-white leading-tight mt-0.5">
            #{registration.ticketNumber}
          </h3>

          {registration.attended ? (
            <div className="mt-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
              <CheckCircle className="h-3.5 w-3.5" />
              Ingresó
            </div>
          ) : (
            <div className="mt-4 bg-amber-500/20 text-cip-gold border border-amber-500/30 rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-display">
              <AlertTriangle className="h-3.5 w-3.5" />
              Pendiente
            </div>
          )}
        </div>

        {/* RIGHT COLUMN / DETAILS */}
        <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest font-display mb-4">
              Datos del Colegiado
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="sm:col-span-2">
                <DataRow 
                  label="Nombre Completo" 
                  value={registration.lastName ? `${registration.lastName}, ${registration.firstName}` : "Colegiado Pre-registrado"} 
                  icon={User} 
                  valueClass="text-gray-950 font-bold text-lg" 
                />
              </div>
              <DataRow 
                label="Nro Colegiatura" 
                value={registration.cip || "SIN CIP"} 
                icon={Shield} 
                valueClass="text-cip-red font-extrabold text-base" 
              />
              <DataRow 
                label="Capítulo" 
                value={registration.chapter} 
                icon={BookOpen} 
              />
              <DataRow 
                label="Especialidad" 
                value={registration.specialty} 
                icon={Briefcase} 
              />
              <DataRow 
                label="Teléfono" 
                value={registration.phone} 
                icon={Phone} 
              />
              <DataRow 
                label="Plato Almuerzo" 
                value={registration.dish || "No seleccionado"} 
                icon={Utensils} 
                valueClass={!registration.dish ? "text-red-500 font-bold" : "text-emerald-600 font-bold"} 
              />
            </div>
          </div>

          {/* Dish selection (only if no dish assigned and not already attended) */}
          {needsDish && !registration.attended && (
            <div className="bg-gray-50/70 rounded-2xl p-4 border border-gray-100/70">
              <p className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider font-display">
                <AlertTriangle className="h-4 w-4 text-cip-gold" />
                Seleccionar Plato Almuerzo:
              </p>
              <div className="flex gap-4">
                <label
                  className={`flex-1 flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                    selectedDish === "Pollo"
                      ? "border-cip-gold bg-cip-gold-light/40 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-xs"
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
                  <Utensils className="h-4 w-4 text-gray-500" />
                  <span className="font-bold text-sm text-gray-800 font-display">Pollo</span>
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-2.5 p-3.5 rounded-xl border-2 cursor-pointer transition-all active:scale-[0.98] ${
                    selectedDish === "Chancho"
                      ? "border-cip-gold bg-cip-gold-light/40 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-xs"
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
                  <Utensils className="h-4 w-4 text-gray-500" />
                  <span className="font-bold text-sm text-gray-800 font-display">Chancho</span>
                </label>
              </div>
            </div>
          )}

          {/* Action area */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-cip-red text-xs uppercase tracking-widest font-bold py-2.5 transition-colors cursor-pointer font-display flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a buscar
            </button>

            <div className="w-full sm:w-auto sm:min-w-[200px]">
              {registration.attended ? (
                <div className="text-center bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 text-emerald-700 text-xs font-bold uppercase tracking-wider font-display flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  Registrado {registration.checkinTime && formatDateTime(registration.checkinTime)}
                </div>
              ) : needsDish && !selectedDish ? (
                <div className="text-center bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-red-500 text-xs font-bold font-display">
                  Elegí plato para confirmar
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DataRowProps {
  label: string;
  value: string | null | undefined;
  valueClass?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function DataRow({
  label,
  value,
  valueClass,
  icon: Icon,
}: DataRowProps) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      {Icon && (
        <div className="text-cip-red/70 mt-0.5 shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 truncate">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold font-display">
          {label}
        </p>
        <p className={`text-sm font-semibold truncate mt-0.5 ${valueClass || "text-gray-700"}`}>
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
