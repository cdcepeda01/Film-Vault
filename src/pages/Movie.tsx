// src/pages/Movie.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMovie, posterUrl } from "../lib/tmdb";
import StarRating from "../components/StarRating";
import { useAuth } from "../auth/useAuth";

import {
  addReview,
  getMovieReviews,
  setRating,
  toggleWatch,
  getWatchlist,
  getRatings,
  getReviewLikes,
  toggleReviewLike,
  bumpReviewLikeCount,
  getReviewLikeCount,
} from "../lib/storage";

export default function Movie() {
  const { id } = useParams();
  const mid = Number(id);
  const { user } = useAuth();

  const [movie, setMovie] = useState<any | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [reviews, setReviews] = useState(() => getMovieReviews(mid));
  const [myLikes, setMyLikes] = useState<string[]>(
    user ? getReviewLikes(user.id) : []
  );

  // modales
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  // estado temporal del modal de reseña
  const [draftRating, setDraftRating] = useState<number>(0);
  const [draftBody, setDraftBody] = useState("");
  const [modalError, setModalError] = useState("");

  const myRating = user
    ? getRatings(user.id).find((r) => r.movieId === mid)?.stars
    : undefined;

  useEffect(() => {
    (async () => {
      setMovie(await getMovie(mid));
    })();
  }, [mid]);

  useEffect(() => {
    if (user) {
      setInWatchlist(getWatchlist(user.id).includes(mid));
      setMyLikes(getReviewLikes(user.id));
    }
  }, [user, mid]);

  if (!movie) {
    return <div className="max-w-6xl mx-auto px-4 py-8">Cargando…</div>;
  }

  const year = (movie.release_date || "").slice(0, 4);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}min`
    : null;

  const genres = movie.genres?.map((g: any) => g.name) ?? [];

  const director = movie.credits?.crew?.find(
    (p: any) => p.job === "Director"
  );
  const writers = movie.credits?.crew?.filter((p: any) =>
    ["Writer", "Screenplay", "Story", "Author"].includes(p.job)
  );
  const cast = movie.credits?.cast?.slice(0, 5) ?? [];

  const trailer =
    movie.videos?.results?.find(
      (v: any) =>
        v.site === "YouTube" &&
        v.type === "Trailer" &&
        v.official
    ) ||
    movie.videos?.results?.find(
      (v: any) => v.site === "YouTube" && v.type === "Trailer"
    );

  const backdrop =
    movie.backdrop_path ||
    (movie.images?.backdrops?.[0]?.file_path ?? null);

  const handleToggleWatchlist = () => {
    if (!user) return;
    toggleWatch(user.id, mid);
    setInWatchlist((prev) => !prev);
  };

  // abrir modal de reseña
  const openReviewModal = () => {
    if (!user) return;
    setModalError("");
    setDraftRating(myRating ?? 0);

    const mine = reviews.find((r) => r.userId === user.id);
    setDraftBody(mine?.body ?? "");
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewAndRating = () => {
    if (!user) return;

    if (!draftRating || draftRating <= 0) {
      setModalError("Primero selecciona una puntuación (al menos 1 estrella).");
      return;
    }

    // Rating
    setRating(user.id, {
      userId: user.id,
      movieId: mid,
      stars: draftRating,
      createdAt: new Date().toISOString(),
    });

    // Reseña opcional
    if (draftBody.trim()) {
      addReview({
        id: crypto.randomUUID(),
        userId: user.id,
        movieId: mid,
        title: "",
        body: draftBody.trim(),
        spoiler: false,
        createdAt: new Date().toISOString(),
      });
    }

    setReviews(getMovieReviews(mid));
    setIsReviewModalOpen(false);
  };

  return (
    <div className="movie-page">
      {/* ===== HERO ESTILO NETFLIX ===== */}
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
            {movie.poster_path && (
              <img
                src={posterUrl(movie.poster_path, "w500")}
                className="movie-page__poster"
              />
            )}
          </div>

          {/* Columna derecha: info + acciones */}
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Título + meta + géneros + sinopsis */}
            <div>
              <h1 className="movie-page__title">
                {movie.title}{" "}
                {year && (
                  <span className="text-gray-300 font-normal">
                    ({year})
                  </span>
                )}
              </h1>

              {/* año · duración · nota · votos */}
              <div className="movie-page__meta-line">
                {year && <span>{year}</span>}
                {runtime && <span>{runtime}</span>}
                {movie.vote_average && (
                  <>
                    <span>⭐ {movie.vote_average.toFixed(1)}</span>
                    {movie.vote_count && (
                      <span>
                        {movie.vote_count.toLocaleString()} votos
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

              {movie.tagline && (
                <p className="movie-page__tagline mt-2">
                  “{movie.tagline}”
                </p>
              )}

              <p className="movie-page__overview mt-2">
                {movie.overview}
              </p>

              {/* director / cast al estilo Netflix */}
              <p className="mt-3 text-xs text-gray-300">
                <span className="font-semibold text-gray-100">
                  Director:
                </span>{" "}
                {director ? director.name : "—"}
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

            {/* Acciones: tráiler, watchlist, reseñar */}
            <div className="movie-page__actions">
              {trailer && (
                <button
                  type="button"
                  className="movie-page__play-btn"
                  onClick={() => setIsTrailerModalOpen(true)}
                >
                  ▶ Ver tráiler
                </button>
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

              <div className="flex flex-col gap-1">
                {user ? (
                  <button
                    type="button"
                    className="movie-page__review-btn"
                    onClick={openReviewModal}
                  >
                    Reseñar o calificar
                  </button>
                ) : (
                  <span className="text-xs text-gray-300">
                    Inicia sesión para puntuar y reseñar.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONTENIDO INFERIOR (FICHA + RESEÑAS) ===== */}
      <div className="movie-page__body">
        {/* Ficha técnica */}
        <section className="movie-page__details-grid">
          <div className="space-y-3">
            <InfoRow label="Género">
              {genres.length ? genres.join(", ") : "—"}
            </InfoRow>
            <InfoRow label="Director">
              {director ? director.name : "—"}
            </InfoRow>
            <InfoRow label="Guion">
              {writers && writers.length
                ? writers.map((w: any) => w.name).join(", ")
                : "—"}
            </InfoRow>
            <InfoRow label="Reparto">
              {cast.length
                ? cast.map((c: any) => c.name).join(" • ")
                : "—"}
            </InfoRow>
          </div>

          <div className="space-y-3">
            <InfoRow label="Fecha de estreno">
              {movie.release_date || "—"}
            </InfoRow>
            <InfoRow label="Popularidad">
              {movie.popularity?.toFixed(0) ?? "—"}
            </InfoRow>
            <InfoRow label="Idioma original">
              {movie.original_language?.toUpperCase() ?? "—"}
            </InfoRow>
            <InfoRow label="Título original">
              {movie.original_title || "—"}
            </InfoRow>
          </div>
        </section>

        {/* Reseñas (solo lectura) */}
        <section className="movie-page__reviews-section">
          <h2 className="movie-page__section-title">
            Reseñas de usuarios
          </h2>

          {user ? (
            <p className="text-sm text-gray-400 mb-2">
              Usa el botón “Reseñar o calificar” para escribir tu reseña.
            </p>
          ) : (
            <p className="text-sm text-gray-400 mb-2">
              Inicia sesión para escribir una reseña.
            </p>
          )}

          <ul className="space-y-3">
            {reviews.map((r) => {
              const liked = user ? myLikes.includes(r.id) : false;
              const count = getReviewLikeCount(r.id);

              return (
                <li key={r.id} className="movie-page__review-card">
                  <div className="text-xs text-gray-500">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                  {r.title && (
                    <div className="font-semibold mt-1">
                      {r.title}
                    </div>
                  )}
                  <p className="text-sm mt-1 text-gray-200">{r.body}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      disabled={!user}
                      className={`text-sm ${
                        liked ? "text-red-500" : "text-gray-400"
                      }`}
                      onClick={() => {
                        if (!user) return;
                        toggleReviewLike(user.id, r.id);
                        bumpReviewLikeCount(r.id, liked ? -1 : +1);
                        setMyLikes(getReviewLikes(user.id));
                      }}
                    >
                      ♥ {count}
                    </button>
                  </div>
                </li>
              );
            })}
            {!reviews.length && (
              <p className="text-sm text-gray-500">
                Aún no hay reseñas para esta película.
              </p>
            )}
          </ul>
        </section>
      </div>

      {/* ===== MODAL RESEÑA/CALIFICACIÓN ===== */}
      {user && isReviewModalOpen && (
        <div className="movie-modal-backdrop">
          <div className="movie-modal">
            <div className="movie-modal__header">
              <h2 className="movie-modal__title">
                Reseñar y calificar — {movie.title}{" "}
                {year && (
                  <span className="movie-modal__year">({year})</span>
                )}
              </h2>
              <button
                type="button"
                className="movie-modal__close"
                onClick={() => setIsReviewModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <span className="movie-modal__field-label">
                Tu puntuación
              </span>
              <StarRating
                value={draftRating}
                onChange={(v: number) => {
                  setDraftRating(v);
                  setModalError("");
                }}
              />
            </div>

            <div>
              <span className="movie-modal__field-label">
                Reseña (opcional)
              </span>
              <textarea
                className="movie-modal__textarea"
                rows={5}
                value={draftBody}
                onChange={(e) => {
                  setDraftBody(e.target.value);
                  setModalError("");
                }}
                placeholder="Cuéntanos qué te pareció la película…"
              />
              {modalError && (
                <p className="text-xs text-red-400 mt-1">
                  {modalError}
                </p>
              )}
            </div>

            <div className="movie-modal__footer">
              <button
                type="button"
                className="movie-modal__secondary"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="movie-modal__primary"
                onClick={handleSaveReviewAndRating}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL TRÁILER ===== */}
      {isTrailerModalOpen && trailer && (
        <div className="movie-modal-backdrop">
          <div className="movie-modal max-w-4xl">
            <div className="movie-modal__header">
              <h2 className="movie-modal__title">
                Tráiler — {movie.title}
              </h2>
              <button
                type="button"
                className="movie-modal__close"
                onClick={() => setIsTrailerModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="movie-modal__trailer-frame">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
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
