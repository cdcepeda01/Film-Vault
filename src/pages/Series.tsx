// src/pages/Series.tsx
import { useEffect, useState } from "react";
import {
  getSeriesOnTheAir,
  getPopularSeries,
  getTopRatedSeries,
  posterUrl,
} from "../lib/tmdb";
import { Shelf } from "../components/organisms/Shelf";
import { useAuth } from "../auth/useAuth";
import { getWatchlistSeries, toggleWatchSeries } from "../lib/storage";

type TvShow = any;
type ChipId = "all" | "onair" | "popular" | "top";

export default function Series() {
  const { user } = useAuth();

  const [onAir, setOnAir] = useState<TvShow[]>([]);
  const [popular, setPopular] = useState<TvShow[]>([]);
  const [topRated, setTopRated] = useState<TvShow[]>([]);
  const [activeChip, setActiveChip] = useState<ChipId>("all");
  const [watchlistIds, setWatchlistIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      setOnAir(await getSeriesOnTheAir());
      setPopular(await getPopularSeries());
      setTopRated(await getTopRatedSeries());
    })();
  }, []);

  useEffect(() => {
    if (!user) {
      setWatchlistIds([]);
      return;
    }
    setWatchlistIds(getWatchlistSeries(user.id));
  }, [user]);

  const handleToggleWatchlist = (showId: number) => {
    if (!user) return;
    toggleWatchSeries(user.id, showId);
    setWatchlistIds((prev) =>
      prev.includes(showId)
        ? prev.filter((id) => id !== showId)
        : [...prev, showId]
    );
  };

  const hero = popular[0] || onAir[0];

  const chips = [
    { id: "all" as ChipId, label: "Todo" },
    { id: "onair" as ChipId, label: "En emisión" },
    { id: "popular" as ChipId, label: "Populares" },
    { id: "top" as ChipId, label: "Mejor valoradas" },
  ];

  return (
    <div className="home-shelves">
      <header className="home-shelves__header">
        <h1 className="home-shelves__title">Tus bóvedas de series</h1>
        <p className="home-shelves__subtitle">
          Explora qué se está emitiendo ahora, las series más comentadas
          y las mejor valoradas por la crítica.
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

      {(activeChip === "all" || activeChip === "onair") && (
        <Shelf
          title="En emisión ahora"
          items={onAir}
          watchlistIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          userCanEdit={!!user}
          kind="tv"
        />
      )}

      {(activeChip === "all" || activeChip === "popular") && (
        <Shelf
          title="Series populares"
          items={popular}
          watchlistIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          userCanEdit={!!user}
          kind="tv"
        />
      )}

      {(activeChip === "all" || activeChip === "top") && (
        <Shelf
          title="Mejor valoradas"
          items={topRated}
          watchlistIds={watchlistIds}
          onToggleWatchlist={handleToggleWatchlist}
          userCanEdit={!!user}
          kind="tv"
        />
      )}
    </div>
  );
}
