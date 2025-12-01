import { posterUrl, type TmdbMovie, type TmdbSeries } from "../../../lib/tmdb";
import type { Review as FirestoreReview } from "../../../lib/reviews";

type UserRating = {
  movieId: number;
  stars: number;
  createdAt: Date;
};

type LastWatchMovie = {
  movie: TmdbMovie;
  addedAt: Date;
};

type Review = FirestoreReview;

interface ProfileSummaryTabProps {
  loading: boolean;
  topRated: UserRating[];
  movieById: Map<number, TmdbMovie>;
  tvById: Map<number, TmdbSeries>;
  recentReviews: Review[];
  avgRating: string;
  lastWatchMovie: LastWatchMovie | null;
}

export function ProfileSummaryTab({
  loading,
  topRated,
  movieById,
  tvById,
  recentReviews,
  avgRating,
  lastWatchMovie,
}: ProfileSummaryTabProps) {
  const lastReview =
    recentReviews.length > 0 ? recentReviews[0] : null;

  const lastReviewMedia = lastReview
    ? lastReview.kind === "movie"
      ? movieById.get(lastReview.refId)
      : tvById.get(lastReview.refId)
    : null;

  let lastReviewTitle = "";
  if (lastReview) {
    if (lastReviewMedia) {
      const anyMedia = lastReviewMedia as any;
      lastReviewTitle =
        anyMedia.title ||
        anyMedia.name ||
        (lastReview.kind === "movie" ? "Película" : "Serie");
    } else {
      lastReviewTitle =
        lastReview.kind === "movie" ? "Película" : "Serie";
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid sm:grid-cols-3 gap-4 text-xs md:text-sm">
        <div className="bg-black/80 border border-red-900/80 p-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-red-400 mb-1">
            ÚLTIMO AÑADIDO
          </div>
          {lastWatchMovie ? (
            <>
              <div className="font-semibold text-sm line-clamp-2">
                {lastWatchMovie.movie.title ??
                  lastWatchMovie.movie.name}
              </div>
              <div className="text-[11px] text-gray-400 mt-1 flex flex-wrap items-center gap-2">
                {lastWatchMovie.movie.release_date && (
                  <span>
                    {lastWatchMovie.movie.release_date.slice(0, 4)}
                  </span>
                )}
                <span>·</span>
                <span>
                  Añadido el{" "}
                  {lastWatchMovie.addedAt.toLocaleDateString()}
                </span>
              </div>
            </>
          ) : (
            <p className="text-[11px] text-gray-500">
              Todavía no has añadido películas a tu watchlist.
            </p>
          )}
        </div>

        <div className="bg-black/80 border border-red-900/80 p-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-red-400 mb-1">
            ÚLTIMA RESEÑA
          </div>
          {lastReview ? (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold text-sm line-clamp-1">
                  {lastReviewTitle}
                </div>
                <div className="text-[11px] bg-yellow-500 text-black px-1.5 py-[1px] font-semibold">
                  ★ {lastReview.rating.toFixed(1)}
                </div>
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {lastReviewMedia &&
                  (lastReviewMedia as any).release_date && (
                    <span>
                      {(lastReviewMedia as any).release_date.slice(
                        0,
                        4
                      )}{" "}
                      ·{" "}
                    </span>
                  )}
                {new Date(lastReview.createdAt).toLocaleDateString()}
              </div>
              <p className="text-[11px] text-gray-200 mt-1 line-clamp-3">
                {lastReview.body || "Sin texto en la reseña."}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-gray-500">
              Todavía no has escrito reseñas.
            </p>
          )}
        </div>

        <div className="bg-black/80 border border-red-900/80 p-3">
          <div className="text-[10px] uppercase tracking-[0.2em] text-red-400 mb-1">
            NOTA MEDIA
          </div>
          <div className="text-2xl font-semibold">
            {avgRating !== "—" ? `${avgRating} / 5` : "—"}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Promedio de tus calificaciones de películas.
          </p>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm md:text-base font-semibold">
            Películas destacadas
          </h2>
          <span className="text-xs text-gray-500">
            Ordenado por tu calificación
          </span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {loading && (
            <div className="text-xs text-gray-400">
              Cargando datos…
            </div>
          )}
          {!loading && topRated.length === 0 && (
            <div className="text-xs text-gray-400">
              Aún no has calificado películas.
            </div>
          )}
          {topRated.map((r) => {
            const mv = movieById.get(r.movieId);
            if (!mv) return null;
            const year = (mv.release_date || "").slice(0, 4);
            return (
              <a
                key={r.movieId}
                href={`#/movie/${r.movieId}`}
                className="shelf-card"
              >
                {mv.poster_path ? (
                  <img
                    src={posterUrl(mv.poster_path, "w342")}
                    className="shelf-card__poster"
                  />
                ) : (
                  <div className="shelf-card__poster bg-gray-800" />
                )}
                <div className="shelf-card__overlay">
                  <div className="shelf-card__title">
                    {mv.title}
                  </div>
                  <div className="shelf-card__meta">
                    {year && <span>{year}</span>}
                    <span>·</span>
                    <span>⭐ {r.stars.toFixed(1)}</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
}
