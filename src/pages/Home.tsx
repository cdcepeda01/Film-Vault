// src/pages/Home.tsx
import { useEffect, useMemo, useState } from "react";
import {
  getTopRated,
  getNowPlaying,
  getUpcoming,
  getTrendingWeek,
  getManyMovies,
  getTopRatedThisYear,
  getTopRatedClassics,
} from "../lib/tmdb";
import { useAuth } from "../auth/useAuth";
import { getWatchlist, toggleWatch } from "../lib/storage";
import { Shelf } from "../components/organisms/Shelf"; // 👈 organismo

// Mapa básico TMDB → nombre de género (para nombres de las estanterías por género)
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
  10751: "Familia",
  9648: "Misterio",
  36: "Historia",
  10752: "Guerra",
  99: "Documental",
};

type Movie = any; // si quieres luego lo cambias a TmdbMovie

// 🔁 Nuevos ids de chips (sin "new", añadimos "genre")
type ChipId = "all" | "top" | "genre" | "trend" | "reco";

// Helper: elegir una "película semilla" para "Porque te gustó X"
function pickSeedMovie(watchlistMovies: Movie[]) {
  if (!watchlistMovies.length) return null;

  const recent = watchlistMovies
    .filter((m) => m.release_date)
    .sort(
      (a, b) =>
        new Date(b.release_date).getTime() -
        new Date(a.release_date).getTime()
    );

  return recent[0] ?? watchlistMovies[0];
}

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

  // Cargar pelis
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

  // Cargar watchlist del usuario (ids)
  useEffect(() => {
    if (!user) {
      setWatchlistIds([]);
      return;
    }
    setWatchlistIds(getWatchlist(user.id));
  }, [user]);

  // Cargar detalles de las pelis en watchlist (para géneros, etc.)
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

  const handleToggleWatchlist = (movieId: number) => {
    if (!user) return;
    toggleWatch(user.id, movieId);
    setWatchlistIds((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    );
  };

  // Chips: quitamos "Nuevos estrenos" y añadimos "Por género"
  const chips = useMemo(
    () => [
      { id: "all" as ChipId, label: "Todo" },
      { id: "top" as ChipId, label: "Más votadas" },
      { id: "genre" as ChipId, label: "Por género" },
      { id: "trend" as ChipId, label: "Tendencias" },
      { id: "reco" as ChipId, label: "Recomendado para ti" },
    ],
    []
  );

  /* ===============================
     Recomendado para ti (personalizado)
     =============================== */

  type PersonalizedShelf = { title: string; items: Movie[] };

  const personalizedShelves: PersonalizedShelf[] = useMemo(() => {
    if (!user || !watchlistMovies.length) return [];

    // 1) Perfil de géneros favoritos
    const genreScores = new Map<number, number>();
    watchlistMovies.forEach((m) => {
      const ids: number[] =
        m.genre_ids ??
        (Array.isArray(m.genres) ? m.genres.map((g: any) => g.id) : []);

      ids.forEach((gid) => {
        genreScores.set(gid, (genreScores.get(gid) ?? 0) + 1);
      });
    });

    if (!genreScores.size) return [];

    const favoriteGenres = [...genreScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([gid]) => gid);

    // Pool general para buscar recomendaciones
    const pool = [
      ...topRated,
      ...trending,
      ...upcoming,
      ...nowPlaying,
    ] as Movie[];

    // Eliminar duplicados por id
    const uniqueMap = new Map<number, Movie>();
    pool.forEach((m) => {
      if (m && !uniqueMap.has(m.id)) uniqueMap.set(m.id, m);
    });
    const fullPool = [...uniqueMap.values()];

    // 2) "Porque te gustó X"
    const seed = pickSeedMovie(watchlistMovies);
    let becauseYouLiked: Movie[] = [];
    if (seed) {
      const gids: number[] = seed.genre_ids ?? [];
      if (gids.length) {
        becauseYouLiked = fullPool
          .filter(
            (m) =>
              m.id !== seed.id &&
              Array.isArray(m.genre_ids) &&
              m.genre_ids.some((g: number) => gids.includes(g))
          )
          .slice(0, 20);
      }
    }

    // 3) Nuevas películas para tu gusto (nowPlaying + upcoming filtrado por géneros)
    const newForYou = [...nowPlaying, ...upcoming].filter(
      (m) =>
        Array.isArray(m.genre_ids) &&
        m.genre_ids.some((gid: number) => favoriteGenres.includes(gid))
    );

    // 4) Clásicos según tu perfil (<2000 + géneros favoritos)
    const classicsForYou = fullPool
      .filter((m) => {
        if (!m.release_date) return false;
        const year = parseInt(String(m.release_date).slice(0, 4));
        return (
          year < 2000 &&
          Array.isArray(m.genre_ids) &&
          m.genre_ids.some((gid: number) => favoriteGenres.includes(gid))
        );
      })
      .slice(0, 20);

    // 5) Lo mejor valorado según tu perfil
    const bestForProfile = fullPool
      .filter(
        (m) =>
          Array.isArray(m.genre_ids) &&
          m.genre_ids.some((gid: number) => favoriteGenres.includes(gid))
      )
      .sort(
        (a, b) =>
          (b.vote_average ?? 0) - (a.vote_average ?? 0)
      )
      .slice(0, 20);

    const shelves: PersonalizedShelf[] = [];

    if (bestForProfile.length) {
      shelves.push({
        title: "Basado en tus géneros favoritos",
        items: bestForProfile,
      });
    }

    if (seed && becauseYouLiked.length) {
      shelves.push({
        title: `Porque te gustó ${seed.title ?? seed.name}`,
        items: becauseYouLiked,
      });
    }

    if (newForYou.length) {
      shelves.push({
        title: "Nuevas películas para ti",
        items: newForYou.slice(0, 20),
      });
    }

    if (classicsForYou.length) {
      shelves.push({
        title: "Clásicos que te podrían encantar",
        items: classicsForYou,
      });
    }

    if (bestForProfile.length) {
      shelves.push({
        title: "Lo mejor valorado para tu perfil",
        items: bestForProfile,
      });
    }

    return shelves;
  }, [
    user,
    watchlistMovies,
    topRated,
    trending,
    upcoming,
    nowPlaying,
  ]);

  /* ===============================
     Estanterías "Por género"
     =============================== */

  const GENRE_SECTIONS = [
    28, // Acción
    35, // Comedia
    18, // Drama
    27, // Terror
    878, // Sci-Fi
    10749, // Romance
    99, // Documental
  ];

  const genreShelves = useMemo(() => {
    const pool = [
      ...topRated,
      ...trending,
      ...nowPlaying,
      ...upcoming,
    ] as Movie[];

    // quitar duplicados
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
      {/* Cabecera de la sección Home */}
      <header className="home-shelves__header">
        <h1 className="home-shelves__title">Tu estantería de cine</h1>
        <p className="home-shelves__subtitle">
          Recorre colecciones curadas: lo mejor valorado, por género, en cines,
          próximos estrenos y lo que está marcando tendencia esta semana.
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

      {/* ===== TODO / MÁS VOTADAS ===== */}
      {(activeChip === "all" || activeChip === "top") && (
        <>
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

      {/* ===== TENDENCIAS ===== */}
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

      {/* ===== POR GÉNERO ===== */}
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

      {/* ===== RECOMENDADO PARA TI ===== */}
      {activeChip === "reco" && (
        <>
          {user ? (
            personalizedShelves.length ? (
              personalizedShelves.map((shelf, idx) => (
                <Shelf
                  key={idx}
                  title={shelf.title}
                  items={shelf.items}
                  watchlistIds={watchlistIds}
                  onToggleWatchlist={handleToggleWatchlist}
                  userCanEdit={!!user}
                />
              ))
            ) : (
              <p className="home-shelves__empty">
                Empieza a añadir películas a tu watchlist para recibir
                recomendaciones personalizadas.
              </p>
            )
          ) : (
            <p className="home-shelves__empty">
              Inicia sesión para ver recomendaciones hechas para ti.
            </p>
          )}
        </>
      )}
    </div>
  );
}
