import { useEffect, useMemo, useState } from "react";
import {
  getTopRated,
  getNowPlaying,
  getUpcoming,
  getTrendingWeek,
  getManyMovies,
  getTopRatedThisYear,
  getTopRatedClassics,
  getRecommendedByGenres,
} from "../lib/tmdb";
import { useAuth } from "../auth/useAuth";
import { Shelf } from "../components/organisms/Shelf";

import {
  listenWatchlist,
  toggleWatchItem,
} from "../lib/watchlist";

const GENRE_LABELS: Record<number, string> = {
  28: "Acción",
  12: "Aventura",
  16: "Animación",
  35: "Comedia",
  80: "Crimen",
  18: "Drama",
  14: "Fantasía",
  27: "Terror",
  10749: "Romance",
  878: "Sci-Fi",
  53: "Thriller",
  9648: "Misterio",
  99: "Documental",
};

type Movie = any; 


type ChipId = "all" | "genre" | "trend";

export default function Home() {
  const { user } = useAuth();

  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [topRatedYear, setTopRatedYear] = useState<Movie[]>([]);
  const [topRatedClassics, setTopRatedClassics] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);

  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);

  const [activeChip, setActiveChip] = useState<ChipId>("all");

  const [favoriteGenres, setFavoriteGenres] = useState<number[]>([]);
  const [genreRecs, setGenreRecs] = useState<Movie[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // ============ Carga de películas base (TMDB) ============

  useEffect(() => {
    (async () => {
      const [
        topRatedData,
        nowPlayingData,
        upcomingData,
        trendingData,
        topYearData,
        topClassicsData,
      ] = await Promise.all([
        getTopRated(),
        getNowPlaying(),
        getUpcoming(),
        getTrendingWeek(),
        getTopRatedThisYear(),
        getTopRatedClassics(),
      ]);

      setTopRated(topRatedData);
      setNowPlaying(nowPlayingData);
      setUpcoming(upcomingData);
      setTrending(trendingData);
      setTopRatedYear(topYearData);
      setTopRatedClassics(topClassicsData);
    })();
  }, []);

  // ============ Watchlist desde Firestore  ============

  useEffect(() => {
    if (!user) {
      setWatchlistIds([]);
      setWatchlistMovies([]);
      return;
    }

    const unsub = listenWatchlist(user.id, (docs) => {
      const onlyMovies = docs.filter((d) => d.kind === "movie");
      const ids = onlyMovies.map((d) => d.refId);
      setWatchlistIds(ids);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    const loadWatchlistMovies = async () => {
      if (!watchlistIds.length) {
        setWatchlistMovies([]);
        return;
      }

      const idsToFetch = watchlistIds.slice(0, 40);
      const movies = await getManyMovies(idsToFetch);
      setWatchlistMovies(movies);
    };

    loadWatchlistMovies();
  }, [watchlistIds]);

  // ============ Construir perfil de géneros favoritos ============

  useEffect(() => {
    if (!user || !watchlistMovies.length) {
      setFavoriteGenres([]);
      return;
    }

    const genreScores = new Map<number, number>();

    watchlistMovies.forEach((m) => {
      const ids: number[] =
        m.genre_ids ??
        (Array.isArray(m.genres) ? m.genres.map((g: any) => g.id) : []);

      ids.forEach((gid) => {
        genreScores.set(gid, (genreScores.get(gid) ?? 0) + 1);
      });
    });

    if (!genreScores.size) {
      setFavoriteGenres([]);
      return;
    }

    const favs = [...genreScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([gid]) => gid);

    setFavoriteGenres(favs);
  }, [user, watchlistMovies]);

  // ============  recomendaciones ============

  useEffect(() => {
    if (!favoriteGenres.length) {
      setGenreRecs([]);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoadingRecs(true);
      try {
        const recs = await getRecommendedByGenres(favoriteGenres);
        if (!cancelled) {
          setGenreRecs(recs ?? []);
        }
      } catch (e) {
        console.error("Error cargando recomendaciones por género", e);
        if (!cancelled) {
          setGenreRecs([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingRecs(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [favoriteGenres]);


  const discoveredForYou = useMemo(() => {
    if (!user || !watchlistMovies.length) return [];

    const globalPoolRaw = [
      ...topRated,
      ...trending,
      ...upcoming,
      ...nowPlaying,
    ] as Movie[];

    const uniqueGlobal = new Map<number, Movie>();
    globalPoolRaw.forEach((m) => {
      if (m && !uniqueGlobal.has(m.id)) uniqueGlobal.set(m.id, m);
    });
    const globalPool = [...uniqueGlobal.values()];

    const basePool: Movie[] = (genreRecs.length ? genreRecs : globalPool).filter(
      Boolean
    );

    const watchlistSet = new Set(watchlistMovies.map((m) => m.id));

    let candidates = basePool.filter(
      (m) => m && !watchlistSet.has(m.id)
    );

    if (favoriteGenres.length) {
      candidates = candidates.filter(
        (m) =>
          Array.isArray(m.genre_ids) &&
          m.genre_ids.some((gid: number) =>
            favoriteGenres.includes(gid)
          )
      );
    }

    return candidates.slice(0, 20);
  }, [
    user,
    watchlistMovies,
    topRated,
    trending,
    upcoming,
    nowPlaying,
    genreRecs,
    favoriteGenres,
  ]);


  const handleToggleWatchlist = async (movieId: number) => {
    if (!user) return;

    setWatchlistIds((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );

    try {
      await toggleWatchItem("movie", movieId, user.id);
    } catch (e) {
      console.error("Error al actualizar watchlist en Firestore", e);
    }
  };

  const chips = useMemo(
    () => [
      { id: "all" as ChipId, label: "Principal" },
      { id: "genre" as ChipId, label: "Por género" },
      { id: "trend" as ChipId, label: "Tendencias" },
    ],
    []
  );



  const GENRE_SECTIONS = Object.keys(GENRE_LABELS).map((k) => Number(k));
  const genreShelves = useMemo(() => {
    const pool = [
      ...topRated,
      ...trending,
      ...nowPlaying,
      ...upcoming,
    ] as Movie[];

    const byId = new Map<number, Movie>();
    pool.forEach((m) => {
      if (m && !byId.has(m.id)) byId.set(m.id, m);
    });
    const uniqueMovies = [...byId.values()];

    return GENRE_SECTIONS.map((gid) => {
      const items = uniqueMovies.filter((m) =>
        Array.isArray(m.genre_ids) ? m.genre_ids.includes(gid) : false
      );
      return {
        genreId: gid,
        label: GENRE_LABELS[gid] ?? "Género",
        items: items.slice(0, 20),
      };
    });
  }, [topRated, trending, nowPlaying, upcoming]);

  return (
    <div className="home-shelves">
      <header className="home-shelves__header">
        <h1 className="home-shelves__title">Tu estantería de cine</h1>
        <p className="home-shelves__subtitle">
          Recorre colecciones curadas: lo mejor valorado, por género, en cines,
          próximos estrenos y descubrimientos hechos para ti.
        </p>

        <div className="home-shelves__chips">
          {chips.map((c) => (
            <button
              key={c.id}
              className={
                "home-shelves__chip" +
                (c.id === activeChip ? " home-shelves__chip--active" : "")
              }
              onClick={() => setActiveChip(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </header>

      {activeChip === "all" && (
        <>
          {user && (
            <>
              {loadingRecs && discoveredForYou.length === 0 && (
                <p className="home-shelves__loading">
                  Cargando recomendaciones personalizadas...
                </p>
              )}
              {discoveredForYou.length > 0 && (
                <Shelf
                  title="Recomendados para ti"
                  items={discoveredForYou}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  userCanEdit={!!user}
                />
              )}
            </>
          )}

          <Shelf
            title="Mejor valoradas por la crítica"
            items={topRated}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
          />
          <Shelf
            title={`Lo mejor de ${new Date().getFullYear()}`}
            items={topRatedYear}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
          />
          <Shelf
            title="Clásicos mejor valorados"
            items={topRatedClassics}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
          />
        </>
      )}

      {(activeChip === "all" || activeChip === "trend") && (
        <>
          <Shelf
            title="Tendencias de la semana"
            items={trending}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
          />
          <Shelf
            title="En cines ahora"
            items={nowPlaying}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
          />
          <Shelf
            title="Próximos estrenos"
            items={upcoming}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
          />
        </>
      )}

      {activeChip === "genre" && (
        <>
          {genreShelves.map(
            (shelf) =>
              shelf.items.length > 0 && (
                <Shelf
                  key={shelf.genreId}
                  title={shelf.label}
                  items={shelf.items}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  userCanEdit={!!user}
                />
              )
          )}
        </>
      )}
    </div>
  );
}
