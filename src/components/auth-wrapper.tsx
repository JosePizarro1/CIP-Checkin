"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

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
        confirmButtonColor: "#1e3a5f",
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-900 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-blue-900 via-blue-950 to-gray-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-white/10 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-500 to-blue-900"></div>
          
          <div className="text-center mb-8 mt-2">
            <span className="text-5xl">🔑</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-3">CIP Check-in</h2>
            <p className="text-sm text-gray-500 mt-1">Control de acceso al sistema</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Usuario
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario (ej: cip)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-900 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-gray-800"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Colegio de Ingenieros del Perú
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
        className="fixed top-4 right-4 z-50 bg-white/80 hover:bg-white text-gray-600 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border border-gray-200 backdrop-blur-sm transition-all cursor-pointer"
      >
        Cerrar Sesión 🚪
      </button>
      {children}
    </>
  );
}
