"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UsuariosPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Verificar que sea admin
  if (session && session.user.rol !== "admin") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Gestión de Usuarios
                </h1>
                <p className="text-xs text-gray-500">
                  Administrar usuarios del sistema
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-12 border border-gray-100 text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-12 h-12 text-emerald-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Próximamente
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Esta sección estará disponible próximamente. Aquí podrás crear y
            administrar usuarios del sistema.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E31E24] to-[#B01820] text-white font-semibold rounded-lg hover:from-[#B01820] hover:to-[#8F1419] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Volver al Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
