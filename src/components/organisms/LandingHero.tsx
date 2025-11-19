// src/components/organisms/LandingHero.tsx
import { useEffect, useState } from "react";
import FeatureSlide from "../molecules/FeatureSlide";
import FvJoinButton from "../atoms/FvJoinButton";

type Slide = { img: string; caption: string };

const SLIDES: Slide[] = [
  {
    img: "/landing/slide1.jpg",
    caption: "Califica películas con estrellas.",
  },
  {
    img: "/landing/slide2.jpg",
    caption: "Escribe reseñas y comparte tu opinión.",
  },
  {
    img: "/landing/slide3.jpg",
    caption: "Crea tu Watchlist y organiza tus pendientes.",
  },
  {
    img: "/landing/slide4.jpg",
    caption: "Sigue tu historial y descubre tendencias.",
  },
  {
    img: "/landing/slide5.jpg",
    caption: "Comparte tu pasión por el cine.",
  }
];

export default function LandingHero() {
  const [idx, setIdx] = useState(0);

  // Auto-rotación cada 4 segundos
  useEffect(() => {
    if (!SLIDES.length) return;
    const t = setInterval(
      () => setIdx((i) => (i + 1) % SLIDES.length),
      4000
    );
    return () => clearInterval(t);
  }, []);

  return (
<section className="fv-hero h-[100vh] flex flex-col relative bg-black">
      <div className="relative flex-1">
        {SLIDES.map((s, i) => (
          <FeatureSlide
            key={i}
            imageUrl={s.img}
            caption={s.caption}
            active={i === idx}
          />
        ))}

        {/* Botón centrado encima de todos los slides */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="mt-40 md:mt-52 pointer-events-auto">
            <FvJoinButton />
          </div>
        </div>

        {/* Controles (prev / next) */}
        {SLIDES.length > 1 && (
          <>
            <button
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 grid place-items-center"
              onClick={() =>
                setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length)
              }
            >
              ‹
            </button>
            <button
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 grid place-items-center"
              onClick={() => setIdx((i) => (i + 1) % SLIDES.length)}
            >
              ›
            </button>
          </>
        )}

        {/* Dots (indicadores) */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`w-2.5 h-2.5 rounded-full ${
                i === idx ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
