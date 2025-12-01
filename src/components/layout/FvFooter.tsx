// src/components/layout/FvFooter.tsx
import { useState } from "react";

export default function FvFooter() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <footer className="fv-footer fv-animate-in-up">
        <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold">Film Vault</div>
            <p className="opacity-70 mt-1">
              El lugar donde vive tu cine.
            </p>
          </div>
          <div>
            <div className="font-semibold">Enlaces</div>
            <ul className="mt-1 space-y-1 opacity-90">
              <li>
                <a href="#/signup" className="hover:underline">
                  Únete
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/cdcepeda01/Film-Vault"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Repositorio
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="font-semibold">Legal</div>
            <ul className="mt-1 space-y-1 opacity-90">
              <li>
                <button
                  type="button"
                  className="hover:underline text-left"
                  onClick={() => setShowTerms(true)}
                >
                  Términos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="hover:underline text-left"
                  onClick={() => setShowPrivacy(true)}
                >
                  Privacidad
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-xs text-center opacity-60 pb-4">
          © {new Date().getFullYear()} Film Vault
        </div>
      </footer>

      {/* ===== TÉRMINOS ===== */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-lg mx-4 border border-red-800 bg-black p-6 text-sm text-gray-100 shadow-[0_25px_80px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">
                TÉRMINOS DE USO DE FILM VAULT
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-white text-lg leading-none"
                onClick={() => setShowTerms(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <p>
                Film Vault es un proyecto educativo, realizado para las materias
                de Taller de Diseño Multimedia 
                y Usablidad. No se garantiza disponibilidad continua del servicio ni la conservación indefinida de tus datos.
              </p>
              <p>
                No alojamos ni reproducimos contenido audiovisual. La
                información de películas y series se obtiene de fuentes
                externas (por ejemplo, la API de TMDB) y puede contener errores
                o estar incompleta.
              </p>
              <p>
                Al usar Film Vault aceptas hacer un uso responsable de la
                plataforma, evitar contenido ofensivo o ilegal en reseñas y
                comentarios, y respetar los derechos de autor de terceros.
              </p>
              <p className="text-xs text-gray-400">
                Proyecto realizado por Cristian Cepeda, Juliana Preciado, Sergio Vivas,
                Karol Bolívar, Juan Bello y Javier Saavedra. 
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-1.5 bg-red-600 text-sm font-semibold hover:bg-red-500 transition"
                onClick={() => setShowTerms(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PRIVACIDAD ===== */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-lg mx-4 border border-red-800 bg-black p-6 text-sm text-gray-100 shadow-[0_25px_80px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">
                POLÍTICA DE PRIVACIDAD
              </h2>
              <button
                type="button"
                className="text-gray-400 hover:text-white text-lg leading-none"
                onClick={() => setShowPrivacy(false)}
              >
                ×
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <p>
                Film Vault almacena únicamente la información necesaria para
                que puedas usar la aplicación: tu cuenta, tus calificaciones,
                tu watchlist y tus reseñas.
              </p>
              <p>
                Los datos se usan solo dentro de la propia app para mostrar tu
                actividad y personalizar tu experiencia. No se venden ni se
                comparten con terceros con fines comerciales.
              </p>
              <p>
                Puedes solicitar eliminar tu información contacta
                al desarrollador del proyecto a través del
                repositorio de GitHub.
              </p>
              <p className="text-xs text-gray-400">
                Este proyecto puede utilizar servicios externos (como Firebase, Firestore y
                TMDB) que tienen sus propias políticas de privacidad. Te
                recomendamos revisarlas por separado.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="px-4 py-1.5 bg-red-600 text-sm font-semibold hover:bg-red-500 transition"
                onClick={() => setShowPrivacy(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
