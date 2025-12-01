import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { listenWatchlist, type WatchlistDoc } from "../lib/watchlist";
import { ProfileAvatar } from "../components/atoms/ProfileAvatar";
import { ProfileTabButton } from "../components/atoms/ProfileTabButton";
import { db } from "../lib/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  type DocumentData,
} from "firebase/firestore";
import {
  getManyMovies,
  getManySeries,
  type TmdbMovie,
  type TmdbSeries,
} from "../lib/tmdb";
import type { Review as FirestoreReview } from "../lib/reviews";

import {
  ProfileSummaryTab,
  ProfileReviewsTab,
  ProfileStatsTab,
} from "../components/organisms/profile";


type ProfileTab = "summary" | "reviews" | "stats";

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

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("summary");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [watchlistDocs, setWatchlistDocs] = useState<WatchlistDoc[]>([]);
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [series, setSeries] = useState<TmdbSeries[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(true);

  useEffect(() => {
    if (!user) {
      setReviews([]);
      return;
    }

    const q = query(
      collection(db, "reviews"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items: Review[] = snapshot.docs.map((snap) => {
        const d = snap.data() as DocumentData;
        return {
          id: snap.id,
          kind: d.kind,
          refId: d.refId,
          userId: d.userId,
          userName: d.userName ?? "Usuario anónimo",
          userPhotoUrl: d.userPhotoUrl ?? null,
          rating: d.rating,
          body: d.body ?? "",
          createdAt: d.createdAt?.toDate?.() ?? new Date(),
        };
      });
      setReviews(items);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setWatchlistDocs([]);
      return;
    }

    const unsub = listenWatchlist(user.id, (items) => {
      setWatchlistDocs(items);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMovies([]);
      setSeries([]);
      setLoadingMovies(false);
      return;
    }

    const movieIds = new Set<number>();
    const tvIds = new Set<number>();

    reviews.forEach((r) => {
      if (r.kind === "movie") movieIds.add(r.refId);
      else if (r.kind === "tv") tvIds.add(r.refId);
    });

    watchlistDocs.forEach((w) => {
      if (w.kind === "movie") movieIds.add(w.refId);
      else if (w.kind === "tv") tvIds.add(w.refId);
    });

    if (!movieIds.size && !tvIds.size) {
      setMovies([]);
      setSeries([]);
      setLoadingMovies(false);
      return;
    }

    (async () => {
      setLoadingMovies(true);
      try {
        const [moviesData, seriesData] = await Promise.all([
          movieIds.size ? getManyMovies(Array.from(movieIds)) : Promise.resolve([]),
          tvIds.size ? getManySeries(Array.from(tvIds)) : Promise.resolve([]),
        ]);
        setMovies(moviesData);
        setSeries(seriesData);
      } finally {
        setLoadingMovies(false);
      }
    })();
  }, [user, reviews, watchlistDocs]);

  const movieById = useMemo(() => {
    const map = new Map<number, TmdbMovie>();
    for (const m of movies) map.set(m.id, m);
    return map;
  }, [movies]);

  const tvById = useMemo(() => {
    const map = new Map<number, TmdbSeries>();
    for (const s of series) map.set(s.id, s);
    return map;
  }, [series]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-10 text-white">
        Debes iniciar sesión para ver tu perfil.
      </div>
    );
  }

  const uAny = user as any;
  const rawName: string =
    (uAny.name as string | undefined) ??
    (uAny.username as string | undefined) ??
    (uAny.email as string | undefined) ??
    "usuario";

  const firstLetter = rawName.charAt(0).toUpperCase();
  const photoUrl: string | null =
    (uAny.photoURL as string | undefined) ?? null;

  const ratings: UserRating[] = useMemo(
    () =>
      reviews
        .filter((r) => r.kind === "movie")
        .map((r) => ({
          movieId: r.refId,
          stars: r.rating,
          createdAt: r.createdAt,
        })),
    [reviews]
  );

  const totalMoviesRated = ratings.length;
  const totalReviews = reviews.length;
  const totalWatchlist = watchlistDocs.length;

  const avgRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
        ).toFixed(1)
      : "—";

  const topRated = [...ratings]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 5);

  const recentReviews = [...reviews]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const lastWatchMovie: LastWatchMovie | null = useMemo(() => {
    const movieEntries = watchlistDocs.filter((w) => w.kind === "movie");
    if (!movieEntries.length) return null;

    const sorted = [...movieEntries].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    const latest = sorted[0];
    const mv = movieById.get(latest.refId);
    if (!mv) return null;

    return { movie: mv, addedAt: latest.createdAt };
  }, [watchlistDocs, movieById]);

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
          <ProfileAvatar photoUrl={photoUrl} letter={firstLetter} />
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

      {/* ===== LAYOUT: CONTENIDO PRINCIPAL ===== */}
      <div className="grid lg:grid-cols-[260px,1fr] gap-6">
        <aside className="hidden lg:block" />

        <main className="space-y-6 lg:col-span-1">
          {/* TABS */}
          <div className="flex border-b border-red-900/60 text-xs md:text-sm">
            <ProfileTabButton
              label="Resumen"
              active={activeTab === "summary"}
              onClick={() => setActiveTab("summary")}
            />
            <ProfileTabButton
              label="Reseñas"
              active={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
            />
            <ProfileTabButton
              label="Estadísticas"
              active={activeTab === "stats"}
              onClick={() => setActiveTab("stats")}
            />
          </div>

          {activeTab === "summary" && (
            <ProfileSummaryTab
              loading={loadingMovies}
              topRated={topRated}
              movieById={movieById}
              tvById={tvById}
              recentReviews={recentReviews}
              avgRating={avgRating}
              lastWatchMovie={lastWatchMovie}
            />
          )}

          {activeTab === "reviews" && (
            <ProfileReviewsTab
              reviews={reviews}
              movieById={movieById}
              tvById={tvById}
            />
          )}

          {activeTab === "stats" && (
            <ProfileStatsTab
              totalMoviesRated={totalMoviesRated}
              totalReviews={totalReviews}
              totalWatchlist={totalWatchlist}
              avgRating={avgRating}
              topGenres={topGenres}
              ratings={ratings}
            />
          )}
        </main>
      </div>
    </div>
  );
}


function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-3 py-2 bg-black/80 border border-red-900/70 min-w-[80px] text-center">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
