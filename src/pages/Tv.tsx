// src/pages/Tv.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTvShow, posterUrl } from "../lib/tmdb";
import { useAuth } from "../auth/useAuth";
import { getWatchlist, toggleWatch } from "../lib/storage";

export default function Tv() {
  const { id } = useParams();
  const tid = Number(id);
  const { user } = useAuth();

  const [show, setShow] = useState<any | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    (async () => {
      setShow(await getTvShow(tid));
    })();
  }, [tid]);

  useEffect(() => {
    if (user) {
      setInWatchlist(getWatchlist(user.id).includes(tid));
    }
  }, [user, tid]);

  if (!show) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-white">
        Cargando…
      </div>
    );
  }

  const year = (show.first_air_date || "").slice(0, 4);
  const genres = show.genres?.map((g: any) => g.name) ?? [];

  const backdrop =
    show.backdrop_path ||
    (show.images?.backdrops?.[0]?.file_path ?? null);

  const creators = show.created_by ?? [];
  const cast = show.credits?.cast?.slice(0, 5) ?? [];

  const trailer =
    show.videos?.results?.find(
      (v: any) =>
        v.site === "YouTube" &&
        v.type === "Trailer" &&
        v.official
    ) ||
    show.videos?.results?.find(
      (v: any) => v.site === "YouTube" && v.type === "Trailer"
    );

  const handleToggleWatchlist = () => {
    if (!user) return;
    toggleWatch(user.id, tid);
    setInWatchlist((prev) => !prev);
  };

  return (
    <div className="movie-page">
      {/* ===== HERO ESTILO NETFLIX (mismas clases que Movie.tsx) ===== */}
      <section className="movie-page__hero">
        {backdrop && (
          <div
            className="movie-page__hero-bg"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${backdrop})`,
            }}
          />
        )}

        <div className="movie-page__hero-overlay" />

        <div className="movie-page__hero-inner">
          {/* Columna izquierda: póster */}
          <div className="flex justify-center md:justify-start">
            {show.poster_path && (
              <img
                src={posterUrl(show.poster_path, "w500")}
                className="movie-page__poster"
              />
            )}
          </div>

          {/* Columna derecha: info + acciones */}
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Título + meta + géneros + sinopsis */}
            <div>
              <h1 className="movie-page__title">
                {show.name}{" "}
                {year && (
                  <span className="text-gray-300 font-normal">
                    ({year})
                  </span>
                )}
              </h1>

              {/* año · temporadas · nota · votos */}
              <div className="movie-page__meta-line">
                {year && <span>{year}</span>}

                {show.number_of_seasons && (
                  <span>
                    {show.number_of_seasons}{" "}
                    {show.number_of_seasons === 1
                      ? "temporada"
                      : "temporadas"}
                  </span>
                )}

                {show.vote_average && (
                  <>
                    <span>⭐ {show.vote_average.toFixed(1)}</span>
                    {show.vote_count && (
                      <span>
                        {show.vote_count.toLocaleString()} votos
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* géneros como chips */}
              {genres.length > 0 && (
                <div className="movie-page__genres">
                  {genres.map((g: string) => (
                    <span key={g} className="movie-page__genre-pill">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {show.tagline && (
                <p className="movie-page__tagline mt-2">
                  “{show.tagline}”
                </p>
              )}

              <p className="movie-page__overview mt-2">
                {show.overview}
              </p>

              {/* creadores / cast al estilo Netflix */}
              <p className="mt-3 text-xs text-gray-300">
                <span className="font-semibold text-gray-100">
                  Creada por:
                </span>{" "}
                {creators.length
                  ? creators.map((c: any) => c.name).join(", ")
                  : "—"}
              </p>

              {cast.length > 0 && (
                <p className="mt-1 text-xs text-gray-300">
                  <span className="font-semibold text-gray-100">
                    Protagonizada por:
                  </span>{" "}
                  {cast.map((c: any) => c.name).join(", ")}
                </p>
              )}
            </div>

            {/* Acciones: watchlist (y en el futuro, reseñar, trailer modal, etc.) */}
            <div className="movie-page__actions">
              {trailer && (
                <a
                  href="#trailer"
                  className="movie-page__play-btn"
                >
                  ▶ Ver tráiler
                </a>
              )}

              {user && (
                <button
                  type="button"
                  onClick={handleToggleWatchlist}
                  className={
                    "movie-page__secondary-btn " +
                    (inWatchlist ? "border-yellow-400 text-yellow-300" : "")
                  }
                >
                  {inWatchlist
                    ? "✓ En tu Watchlist"
                    : "+ Añadir a Watchlist"}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENIDO INFERIOR (FICHA) ===== */}
      <div className="movie-page__body">
        <section className="movie-page__details-grid">
          <div className="space-y-3">
            <InfoRow label="Género">
              {genres.length ? genres.join(", ") : "—"}
            </InfoRow>
            <InfoRow label="Número de temporadas">
              {show.number_of_seasons ?? "—"}
            </InfoRow>
            <InfoRow label="Episodios totales">
              {show.number_of_episodes ?? "—"}
            </InfoRow>
            <InfoRow label="Estado">
              {show.status || "—"}
            </InfoRow>
          </div>

          <div className="space-y-3">
            <InfoRow label="Primera emisión">
              {show.first_air_date || "—"}
            </InfoRow>
            <InfoRow label="Última emisión">
              {show.last_air_date || "—"}
            </InfoRow>
            <InfoRow label="Idioma original">
              {show.original_language?.toUpperCase() ?? "—"}
            </InfoRow>
            <InfoRow label="Título original">
              {show.original_name || "—"}
            </InfoRow>
          </div>
        </section>

        {/* Tráiler (anclado para el botón de arriba) */}
        {trailer && (
          <section id="trailer" className="movie-page__trailer">
            <h2 className="movie-page__section-title mb-4">
              Tráiler
            </h2>
            <div className="movie-page__trailer-frame">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-28 text-xs uppercase tracking-[0.18em] text-gray-400">
        {label}
      </div>
      <div className="flex-1 text-sm text-gray-100">{children}</div>
    </div>
  );
}
