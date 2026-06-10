"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { KeyRound, LogOut, User, Lock, Loader2 } from "lucide-react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const expectedUser = process.env.NEXT_PUBLIC_ADMIN_USER || "cip";
  const expectedPass = process.env.NEXT_PUBLIC_ADMIN_PASS || "cip";

  useEffect(() => {
    // Check local storage for existing session
    const session = localStorage.getItem("cip_session");
    if (session === "true") {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === expectedUser && password === expectedPass) {
      localStorage.setItem("cip_session", "true");
      setIsAuthenticated(true);
      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: "Sesión iniciada correctamente",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Credenciales incorrectas",
        text: "Por favor, verifique el usuario y la contraseña",
        confirmButtonColor: "#8b1b1b",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("cip_session");
    setIsAuthenticated(false);
  };

  // Prevent flash before checking localstorage
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-cip-red" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-cip-red via-red-950 to-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cip-gold via-yellow-400 to-cip-gold"></div>
          
          <div className="text-center mb-8 mt-2 flex flex-col items-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-cip-red shadow-inner">
              <KeyRound className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mt-4 font-display uppercase tracking-wide">CIP Check-in</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-wider font-display">Control de Acceso</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 font-display mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario administrador"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cip-gold focus:outline-none focus:ring-4 focus:ring-cip-gold/20 transition-all text-gray-800 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 font-display mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cip-gold focus:outline-none focus:ring-4 focus:ring-cip-gold/20 transition-all text-gray-800 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-cip-red hover:bg-cip-red-hover active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md cursor-pointer font-display uppercase tracking-widest text-xs"
            >
              Iniciar Sesión
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-8 font-display">
            CIP - CD Tacna
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Expose logout button inside layout contexts if needed */}
      <button
        onClick={handleLogout}
        className="fixed top-4 right-4 z-50 bg-white/80 hover:bg-white text-gray-600 hover:text-cip-red px-3 py-2 rounded-xl text-xs font-bold shadow-md border border-gray-100 backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5 font-display uppercase tracking-wider active:scale-95"
      >
        <LogOut className="h-3.5 w-3.5" />
        Salir
      </button>
      {children}
    </>
  );
}
