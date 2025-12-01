import { useEffect, useRef, useState } from "react";
import FeatureSlide from "../molecules/FeatureSlide";
import FvJoinButton from "../atoms/FvJoinButton";

import slide1 from "../../assets/landing/slide1.jpg";
import slide2 from "../../assets/landing/slide2.jpg";
import slide3 from "../../assets/landing/slide3.jpg";
import slide4 from "../../assets/landing/slide4.jpg";
import slide5 from "../../assets/landing/slide5.jpg";

type Slide = { img: string; caption: string };

const SLIDES: Slide[] = [
  { img: slide1, caption: "Califica películas con estrellas." },
  { img: slide2, caption: "Escribe reseñas y comparte tu opinión." },
  { img: slide3, caption: "Crea tu Watchlist y organiza tus pendientes." },
  { img: slide4, caption: "Sigue tu historial y descubre tendencias." },
  { img: slide5, caption: "Comparte tu pasión por el cine." },
];

const AUTO_DELAY = 4000; // ms

export default function LandingHero() {
  const [idx, setIdx] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!SLIDES.length) return;

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIdx((i) => (i + 1) % SLIDES.length);
    }, AUTO_DELAY);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [idx]);

  const goPrev = () => {
    setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length);
  };

  const goNext = () => {
    setIdx((i) => (i + 1) % SLIDES.length);
  };

  const goTo = (index: number) => {
    setIdx(index);
  };

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

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="mt-40 md:mt-52 pointer-events-auto">
            <FvJoinButton />
          </div>
        </div>

        {SLIDES.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 grid place-items-center cursor-pointer"
              onClick={goPrev}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 grid place-items-center cursor-pointer"
              onClick={goNext}
            >
              ›
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer ${
                i === idx ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
