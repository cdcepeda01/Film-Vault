// src/pages/Profile.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import {
  getRatings,
  getWatchlist,
  getAllReviews,
} from "../lib/storage";
import { getManyMovies, posterUrl, type TmdbMovie } from "../lib/tmdb";
import type { Rating, Review } from "../types";

type ProfileTab = "summary" | "reviews" | "stats";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("summary");

  const [ratings, setRatings] = useState<Rating[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== CARGA DE DATOS =====
  useEffect(() => {
    if (!user) return;

    const rt = getRatings(user.id);
    const allReviews = getAllReviews().filter(
      (r) => r.userId === user.id
    );
    const wl = getWatchlist(user.id);

    setRatings(rt);
    setReviews(allReviews);
    setWatchlistIds(wl);

    const ids = Array.from(
      new Set([
        ...rt.map((r) => r.movieId),
        ...allReviews.map((r) => r.movieId),
        ...wl,
      ])
    );

    if (!ids.length) {
      setMovies([]);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await getManyMovies(ids);
        setMovies(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const movieById = useMemo(() => {
    const map = new Map<number, TmdbMovie>();
    for (const m of movies) map.set(m.id, m);
    return map;
  }, [movies]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-10 text-white">
        Debes iniciar sesión para ver tu perfil.
      </div>
    );
  }
  // justo después del if (!user) return ...;

  const uAny = user as any; // atajo para no repetir
  const rawName: string =
    (uAny.name as string | undefined) ??
    (uAny.username as string | undefined) ??
    (uAny.email as string | undefined) ??
    "usuario";

  const firstLetter = rawName.charAt(0).toUpperCase();


  /* ====== Estadísticas básicas ====== */
  const totalMoviesRated = ratings.length;
  const totalReviews = reviews.length;
  const totalWatchlist = watchlistIds.length;

  const avgRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
        ).toFixed(1)
      : "—";

  // top mejores puntuaciones del usuario (para carrusel)
  const topRated = [...ratings]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 7);

  const recentReviews = [...reviews]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // ===== Estadísticas por género (corrigiendo el error de mv.genres) =====
  const genreCount: Record<string, number> = {};
  for (const r of ratings) {
    const mv = movieById.get(r.movieId);
    const genres = (mv as any)?.genres as { name?: string }[] | undefined;
    if (!genres) continue;

    for (const g of genres) {
      const name = g.name;
      if (!name) continue;
      genreCount[name] = (genreCount[name] || 0) + 1;
    }
  }
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className="profile max-w-6xl mx-auto px-4 pt-24 pb-10 text-white">
      {/* ===== CABECERA PERFIL ===== */}
      <header className="profile__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-700 flex items-center justify-center text-lg font-bold">
            {firstLetter}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">@{rawName}</h1>
            <p className="text-sm text-gray-400">
              Tu actividad en FilmVault
            </p>
          </div>
        </div>

        {/* tarjetas stats superiores */}
        <div className="flex gap-3 text-sm">
          <StatPill label="Películas" value={totalMoviesRated} />
          <StatPill label="Reseñas" value={totalReviews} />
          <StatPill label="Watchlist" value={totalWatchlist} />
        </div>
      </header>

      {/* ===== LAYOUT: SIDEBAR + CONTENIDO ===== */}
      <div className="grid lg:grid-cols-[260px,1fr] gap-6">
        {/* SIDEBAR WATCHLIST */}
        <aside className="bg-black/70 border border-red-900/60 rounded-2xl p-4">
          <h2 className="text-sm font-semibold mb-3">
            Mi Watchlist
          </h2>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between py-1 px-2 rounded-lg bg-white/5">
              <span className="text-gray-300">Por ver pronto</span>
              <span className="text-gray-100">
                {totalWatchlist}
              </span>
            </li>
            <li className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/5 transition">
              <span className="text-gray-500">
                Favoritas 
              </span>
              <span className="text-gray-500">0</span>
            </li>
            <li className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/5 transition">
              <span className="text-gray-500">
                Series en curso 
              </span>
              <span className="text-gray-500">0</span>
            </li>
          </ul>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="space-y-6">
          {/* TABS */}
          <div className="flex border-b border-red-900/60 text-xs md:text-sm">
            <TabButton
              label="Resumen"
              active={activeTab === "summary"}
              onClick={() => setActiveTab("summary")}
            />
            <TabButton
              label="Reseñas"
              active={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
            />
            <TabButton
              label="Estadísticas"
              active={activeTab === "stats"}
              onClick={() => setActiveTab("stats")}
            />
          </div>

          {/* CONTENIDO DE CADA TAB */}
          {activeTab === "summary" && (
            <SummaryTab
              loading={loading}
              topRated={topRated}
              movieById={movieById}
              recentReviews={recentReviews}
              avgRating={avgRating}
            />
          )}

          {activeTab === "reviews" && (
            <ReviewsTab
              reviews={reviews}
              movieById={movieById}
            />
          )}

          {activeTab === "stats" && (
            <StatsTab
              totalMoviesRated={totalMoviesRated}
              totalReviews={totalReviews}
              totalWatchlist={totalWatchlist}
              avgRating={avgRating}
              topGenres={topGenres}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/* ====== COMPONENTES AUXILIARES ====== */

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 py-2 rounded-xl bg-black/80 border border-red-900/70 min-w-[80px] text-center">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-4 py-2 border-b-2 -mb-px transition text-xs md:text-sm " +
        (active
          ? "border-red-500 text-white"
          : "border-transparent text-gray-400 hover:text-gray-200 hover:border-red-700")
      }
    >
      {label}
    </button>
  );
}

/* ===== TAB: RESUMEN ===== */

function SummaryTab({
  loading,
  topRated,
  movieById,
  recentReviews,
  avgRating,
}: {
  loading: boolean;
  topRated: Rating[];
  movieById: Map<number, TmdbMovie>;
  recentReviews: Review[];
  avgRating: string;
}) {
  return (
    <div className="space-y-6">
      {/* Sub stats resumidas */}
      <section className="grid sm:grid-cols-3 gap-4 text-xs md:text-sm">
        <div className="bg-black/70 border border-red-900/60 rounded-2xl p-3">
          <div className="text-gray-400 mb-1">Viendo ahora</div>
          <p className="text-gray-300 text-xs">
            (Próximamente: progreso de series)
          </p>
        </div>
        <div className="bg-black/70 border border-red-900/60 rounded-2xl p-3">
          <div className="text-gray-400 mb-1">Última reseña</div>
          {recentReviews[0] ? (
            <p className="text-gray-200 text-xs line-clamp-2">
              {recentReviews[0].body}
            </p>
          ) : (
            <p className="text-gray-500 text-xs">
              Todavía no has escrito reseñas.
            </p>
          )}
        </div>
        <div className="bg-black/70 border border-red-900/60 rounded-2xl p-3">
          <div className="text-gray-400 mb-1">Nota media</div>
          <div className="text-lg font-semibold">
            {avgRating !== "—" ? `${avgRating} / 5` : "—"}
          </div>
        </div>
      </section>

      {/* Películas destacadas (carrusel) */}
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
                className="min-w-[140px] sm:min-w-[160px] bg-black/70 border border-red-900/60 rounded-2xl overflow-hidden hover:-translate-y-1 transition-transform"
              >
                {mv.poster_path && (
                  <img
                    src={posterUrl(mv.poster_path, "w342")}
                    className="w-full aspect-[2/3] object-cover"
                  />
                )}
                <div className="p-2 text-xs">
                  <div className="font-semibold line-clamp-2">
                    {mv.title}
                  </div>
                  <div className="text-gray-400 flex items-center justify-between mt-1">
                    <span>{year}</span>
                    <span className="bg-yellow-500 text-black px-1.5 py-[1px] rounded text-[11px] font-semibold">
                      {r.stars.toFixed(1)}
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Reseñas recientes */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm md:text-base font-semibold">
            Reseñas recientes
          </h2>
          <span className="text-xs text-gray-500">
            Lo último de tu actividad
          </span>
        </div>

        <div className="space-y-3">
          {recentReviews.length === 0 && (
            <p className="text-xs text-gray-500">
              Todavía no has escrito reseñas.
            </p>
          )}

          {recentReviews.map((r) => {
            const mv = movieById.get(r.movieId);
            const year = mv?.release_date?.slice(0, 4);
            return (
              <div
                key={r.id}
                className="flex gap-3 bg-black/70 border border-red-900/60 rounded-2xl p-3"
              >
                <div className="w-12 sm:w-16 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
                  {mv?.poster_path && (
                    <img
                      src={posterUrl(mv.poster_path, "w342")}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="text-xs md:text-sm flex-1">
                  <div className="font-semibold">
                    {mv?.title || "Película"}
                    {year && (
                      <span className="text-gray-400 font-normal">
                        {" "}
                        ({year})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400 mb-1">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </div>
                  <p className="text-gray-200 line-clamp-3">
                    {r.body}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ===== TAB: TODAS LAS RESEÑAS ===== */

function ReviewsTab({
  reviews,
  movieById,
}: {
  reviews: Review[];
  movieById: Map<number, TmdbMovie>;
}) {
  const sorted = [...reviews].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  return (
    <section className="space-y-3">
      {sorted.length === 0 && (
        <p className="text-sm text-gray-500">
          Todavía no has escrito reseñas.
        </p>
      )}

      {sorted.map((r) => {
        const mv = movieById.get(r.movieId);
        const year = mv?.release_date?.slice(0, 4);
        return (
          <div
            key={r.id}
            className="flex gap-3 bg-black/70 border border-red-900/60 rounded-2xl p-3"
          >
            <div className="w-12 sm:w-16 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
              {mv?.poster_path && (
                <img
                  src={posterUrl(mv.poster_path, "w342")}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-xs md:text-sm flex-1">
              <div className="font-semibold">
                {mv?.title || "Película"}
                {year && (
                  <span className="text-gray-400 font-normal">
                    {" "}
                    ({year})
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-400 mb-1">
                {new Date(r.createdAt).toLocaleString()}
              </div>
              <p className="text-gray-200 whitespace-pre-line">
                {r.body}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ===== TAB: ESTADÍSTICAS ===== */

function StatsTab({
  totalMoviesRated,
  totalReviews,
  totalWatchlist,
  avgRating,
  topGenres,
}: {
  totalMoviesRated: number;
  totalReviews: number;
  totalWatchlist: number;
  avgRating: string;
  topGenres: [string, number][];
}) {
  return (
    <section className="grid md:grid-cols-2 gap-4 text-xs md:text-sm">
      <div className="bg-black/70 border border-red-900/60 rounded-2xl p-4 space-y-1">
        <h3 className="font-semibold mb-1">Resumen general</h3>
        <p className="text-gray-300">
          Películas calificadas:{" "}
          <span className="font-semibold">
            {totalMoviesRated}
          </span>
        </p>
        <p className="text-gray-300">
          Reseñas escritas:{" "}
          <span className="font-semibold">
            {totalReviews}
          </span>
        </p>
        <p className="text-gray-300">
          En tu Watchlist:{" "}
          <span className="font-semibold">
            {totalWatchlist}
          </span>
        </p>
        <p className="text-gray-300">
          Nota media:{" "}
          <span className="font-semibold">
            {avgRating !== "—" ? `${avgRating} / 5` : "—"}
          </span>
        </p>
      </div>

      <div className="bg-black/70 border border-red-900/60 rounded-2xl p-4">
        <h3 className="font-semibold mb-2">
          Géneros favoritos
        </h3>
        {topGenres.length === 0 ? (
          <p className="text-gray-500 text-xs">
            Aún no hay suficientes datos de géneros.
          </p>
        ) : (
          <ul className="space-y-2">
            {topGenres.map(([name, count]) => (
              <li
                key={name}
                className="flex items-center justify-between"
              >
                <span className="text-gray-200">{name}</span>
                <span className="text-gray-400 text-xs">
                  {count} títulos
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
