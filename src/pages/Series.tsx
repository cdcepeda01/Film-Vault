import { useEffect, useMemo, useState } from "react";
import {
  getSeriesOnTheAir,
  getPopularSeries,
  getTopRatedSeries,
  getManySeries,
  getTrendingTvWeek, 
} from "../lib/tmdb";
import { Shelf } from "../components/organisms/Shelf";
import { useAuth } from "../auth/useAuth";

import {
  listenWatchlist,
  toggleWatchItem,
  type WatchlistDoc,
} from "../lib/watchlist";

type TvShow = any;
type ChipId = "all" | "genre" | "trend";

const GENRE_LABELS_TV: Record<number, string> = {
  10759: "Acción & Aventura",
  16: "Animación",
  35: "Comedia",
  80: "Crimen",
  99: "Documental",
  18: "Drama",
  10751: "Familia",
  10762: "Kids",
  9648: "Misterio",
  10763: "Noticias",
  10764: "Reality",
  10765: "Sci-Fi & Fantasía",
  10766: "Telenovela",
  10767: "Talk Show",
  10768: "Guerra & Política",
  37: "Western",
};

export default function Series() {
  const { user } = useAuth();

  const [onAir, setOnAir] = useState<TvShow[]>([]);
  const [popular, setPopular] = useState<TvShow[]>([]);
  const [topRated, setTopRated] = useState<TvShow[]>([]);
  const [trending, setTrending] = useState<TvShow[]>([]); 

  const [activeChip, setActiveChip] = useState<ChipId>("all");

  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);
  const [watchlistShows, setWatchlistShows] = useState<TvShow[]>([]);
  const [favoriteGenres, setFavoriteGenres] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      const [
        onAirData,
        popularData,
        topRatedData,
        trendingData,
      ] = await Promise.all([
        getSeriesOnTheAir(),
        getPopularSeries(),
        getTopRatedSeries(),
        getTrendingTvWeek(), 
      ]);

      setOnAir(onAirData);
      setPopular(popularData);
      setTopRated(topRatedData);
      setTrending(trendingData);
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setWatchlistIds([]);
      setWatchlistShows([]);
      return;
    }

    const unsubscribe = listenWatchlist(user.id, (docs: WatchlistDoc[]) => {
      const ids = docs
        .filter((d) => d.kind === "tv")
        .map((d) => d.refId);
      setWatchlistIds(ids);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const loadWatchlistShows = async () => {
      if (!watchlistIds.length) {
        setWatchlistShows([]);
        return;
      }

      const idsToFetch = watchlistIds.slice(0, 40);
      const shows = await getManySeries(idsToFetch);
      setWatchlistShows(shows);
    };

    loadWatchlistShows();
  }, [watchlistIds]);

  useEffect(() => {
    if (!user || !watchlistShows.length) {
      setFavoriteGenres([]);
      return;
    }

    const genreScores = new Map<number, number>();

    watchlistShows.forEach((s) => {
      const ids: number[] =
        s.genre_ids ??
        (Array.isArray(s.genres) ? s.genres.map((g: any) => g.id) : []);

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
  }, [user, watchlistShows]);

  const recommendedForYou = useMemo(() => {
    if (!user || !favoriteGenres.length) return [];

    const poolRaw = [...topRated, ...popular, ...onAir, ...trending] as TvShow[];

    const byId = new Map<number, TvShow>();
    poolRaw.forEach((s) => {
      if (s && !byId.has(s.id)) byId.set(s.id, s);
    });
    const pool = [...byId.values()];

    const watchSet = new Set(watchlistShows.map((s) => s.id));

    const filtered = pool.filter(
      (s) =>
        s &&
        !watchSet.has(s.id) &&
        Array.isArray(s.genre_ids) &&
        s.genre_ids.some((gid: number) => favoriteGenres.includes(gid))
    );

    return filtered.slice(0, 20);
  }, [user, favoriteGenres, watchlistShows, topRated, popular, onAir, trending]);

  const GENRE_SECTIONS = Object.keys(GENRE_LABELS_TV).map((k) => Number(k));

  const genreShelves = useMemo(() => {
    const pool = [...topRated, ...popular, ...onAir] as TvShow[];

    const byId = new Map<number, TvShow>();
    pool.forEach((s) => {
      if (s && !byId.has(s.id)) byId.set(s.id, s);
    });
    const uniqueShows = [...byId.values()];

    return GENRE_SECTIONS.map((gid) => {
      const items = uniqueShows.filter((s) =>
        Array.isArray(s.genre_ids) ? s.genre_ids.includes(gid) : false
      );
      return {
        genreId: gid,
        label: GENRE_LABELS_TV[gid] ?? "Género",
        items: items.slice(0, 20),
      };
    });
  }, [topRated, popular, onAir]);

  
  const globalTrending = useMemo(() => trending.slice(0, 20), [trending]);

  const trendingMiniseries = useMemo(() => {
    const term1 = "miniserie";
    const term2 = "mini serie";
    return trending.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const overview = (s.overview || "").toLowerCase();
      return (
        name.includes(term1) ||
        name.includes(term2) ||
        overview.includes(term1) ||
        overview.includes(term2)
      );
    }).slice(0, 20);
  }, [trending]);

  const trendingRecent = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return trending
      .filter((s) => {
        if (!s.first_air_date) return false;
        const year = parseInt(String(s.first_air_date).slice(0, 4));
        return year >= currentYear - 1;
      })
      .slice(0, 20);
  }, [trending]);

  const trendingByGenreShelves = useMemo(() => {
    if (!trending.length) return [];

    const genreCounts = new Map<number, number>();

    trending.forEach((s) => {
      const ids: number[] = Array.isArray(s.genre_ids) ? s.genre_ids : [];
      ids.forEach((gid) => {
        genreCounts.set(gid, (genreCounts.get(gid) ?? 0) + 1);
      });
    });

    if (!genreCounts.size) return [];

    const topGenres = [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // top 3 géneros
      .map(([gid]) => gid);

    return topGenres.map((gid) => {
      const items = trending.filter(
        (s) =>
          Array.isArray(s.genre_ids) && s.genre_ids.includes(gid)
      );
      return {
        genreId: gid,
        label: `Tendencias en ${GENRE_LABELS_TV[gid] ?? "este género"}`,
        items: items.slice(0, 20),
      };
    });
  }, [trending]);

  const handleToggleWatchlist = async (showId: number) => {
    if (!user) return;
    await toggleWatchItem("tv", showId, user.id);
  };

  const chips = [
    { id: "all" as ChipId, label: "Principal" },
    { id: "genre" as ChipId, label: "Por género" },
    { id: "trend" as ChipId, label: "Tendencias" },
  ];

  return (
    <div className="home-shelves">
      <header className="home-shelves__header">
        <h1 className="home-shelves__title">Tus bóvedas de series</h1>
        <p className="home-shelves__subtitle">
          Descubre qué se está emitiendo ahora, las series más comentadas,
          las mejor valoradas y recomendaciones hechas según tu watchlist.
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
          {user && recommendedForYou.length > 0 && (
            <Shelf
              title="Recomendadas para ti"
              items={recommendedForYou}
              watchlistIds={watchlistIds}
              onToggleWatchlist={handleToggleWatchlist}
              userCanEdit={!!user}
              kind="tv"
            />
          )}

          <Shelf
            title="En emisión ahora"
            items={onAir}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
            kind="tv"
          />

          <Shelf
            title="Series populares"
            items={popular}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
            kind="tv"
          />

          <Shelf
            title="Mejor valoradas"
            items={topRated}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            userCanEdit={!!user}
            kind="tv"
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
                  kind="tv"
                />
              )
          )}
        </>
      )}

      {activeChip === "trend" && (
        <>
          {globalTrending.length > 0 && (
            <Shelf
              title="Tendencias globales de la semana"
              items={globalTrending}
              watchlistIds={watchlistIds}
              onToggleWatchlist={handleToggleWatchlist}
              userCanEdit={!!user}
              kind="tv"
            />
          )}

          {trendingMiniseries.length > 0 && (
            <Shelf
              title="Miniseries en tendencia"
              items={trendingMiniseries}
              watchlistIds={watchlistIds}
              onToggleWatchlist={handleToggleWatchlist}
              userCanEdit={!!user}
              kind="tv"
            />
          )}

          {trendingRecent.length > 0 && (
            <Shelf
              title="Estrenos recientes en tendencia"
              items={trendingRecent}
              watchlistIds={watchlistIds}
              onToggleWatchlist={handleToggleWatchlist}
              userCanEdit={!!user}
              kind="tv"
            />
          )}

          {trendingByGenreShelves.map(
            (shelf) =>
              shelf.items.length > 0 && (
                <Shelf
                  key={shelf.genreId}
                  title={shelf.label}
                  items={shelf.items}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  userCanEdit={!!user}
                  kind="tv"
                />
              )
          )}
        </>
      )}
    </div>
  );
}
