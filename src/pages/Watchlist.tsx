import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { listenWatchlist, type WatchlistDoc } from "../lib/watchlist";
import { getManyMovies, getManySeries, posterUrl } from "../lib/tmdb";

type TmdbItem = any;

type SortMode = "added" | "title" | "year";
type FilterMode = "all" | "movie" | "tv";

interface WatchItem {
  id: number; 
  kind: "movie" | "tv";
  createdAt: Date;
  data: TmdbItem;
}

const FILTER_LABELS: Record<FilterMode, string> = {
  all: "Todo",
  movie: "Películas",
  tv: "Series",
};

const SORT_LABELS: Record<SortMode, string> = {
  added: "Fecha añadido",
  title: "Título (A-Z)",
  year: "Año",
};

type OpenSelect = "none" | "filter" | "sort";

export default function Watchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchItem[] | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("added");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [openSelect, setOpenSelect] = useState<OpenSelect>("none");

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const unsubscribe = listenWatchlist(user.id, (docs: WatchlistDoc[]) => {
      if (!docs.length) {
        setItems([]);
        return;
      }

      (async () => {
        const movieIds = docs
          .filter((d) => d.kind === "movie")
          .map((d) => d.refId);

        const seriesIds = docs
          .filter((d) => d.kind === "tv")
          .map((d) => d.refId);

        const [moviesData, seriesData] = await Promise.all([
          movieIds.length ? getManyMovies(movieIds) : Promise.resolve([]),
          seriesIds.length ? getManySeries(seriesIds) : Promise.resolve([]),
        ]);

        const movieMap = new Map<number, TmdbItem>();
        moviesData.forEach((m: any) => movieMap.set(m.id, m));

        const seriesMap = new Map<number, TmdbItem>();
        seriesData.forEach((s: any) => seriesMap.set(s.id, s));

        const combined: WatchItem[] = docs
          .map((doc) => {
            const data =
              doc.kind === "movie"
                ? movieMap.get(doc.refId)
                : seriesMap.get(doc.refId);

            if (!data) return null;

            return {
              id: doc.refId,
              kind: doc.kind,
              createdAt: doc.createdAt,
              data,
            } as WatchItem;
          })
          .filter((x): x is WatchItem => x !== null);

        setItems(combined);
      })().catch((err) => {
        console.error("Error cargando detalles de watchlist:", err);
        setItems([]);
      });
    });

    return () => unsubscribe();
  }, [user]);

  const processedItems = useMemo(() => {
    if (!items) return null;
    let list = [...items];

    if (filterMode !== "all") {
      list = list.filter((it) => it.kind === filterMode);
    }

    switch (sortMode) {
      case "title":
        list.sort((a, b) =>
          (a.data.title || a.data.name || "").localeCompare(
            b.data.title || b.data.name || "",
            "es",
            { sensitivity: "base" }
          )
        );
        break;

      case "year":
        list.sort((a, b) => {
          const dateA = a.data.release_date || a.data.first_air_date || "";
          const dateB = b.data.release_date || b.data.first_air_date || "";
          const yearA = parseInt(dateA.slice(0, 4)) || 0;
          const yearB = parseInt(dateB.slice(0, 4)) || 0;
          return yearB - yearA;
        });
        break;

      case "added":
      default:
        list.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
        break;
    }

    return list;
  }, [items, sortMode, filterMode]);

  const hasItems = processedItems && processedItems.length > 0;

  const movieCount = items
    ? items.filter((it) => it.kind === "movie").length
    : 0;
  const tvCount = items
    ? items.filter((it) => it.kind === "tv").length
    : 0;

  if (!user) {
    return (
      <div className="watchlist">
        <div className="watchlist__header">
          <div className="watchlist__intro">
            <h1 className="watchlist__title">Tu bóveda personal</h1>
            <p className="watchlist__subtitle">
              Inicia sesión para ver y organizar tu watchlist.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (items === null) {
    return (
      <div className="watchlist">
        <div className="watchlist__header">
          <div className="watchlist__intro">
            <h1 className="watchlist__title">Tu bóveda personal</h1>
            <p className="watchlist__subtitle">
              Cargando tu watchlist…
            </p>
          </div>

          <WatchlistFilters
            sortMode={sortMode}
            setSortMode={setSortMode}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            openSelect={openSelect}
            setOpenSelect={setOpenSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist">
      <div className="watchlist__header">
        <div className="watchlist__intro">
          <h1 className="watchlist__title">Tu bóveda personal</h1>
          <p className="watchlist__subtitle">
            Todas las películas y series que has guardado en Film Vault.
          </p>

          {items && items.length > 0 && (
            <p className="watchlist__stats">
              {movieCount} {movieCount === 1 ? "película" : "películas"} ·{" "}
              {tvCount} {tvCount === 1 ? "serie" : "series"}
            </p>
          )}
        </div>

        <WatchlistFilters
          sortMode={sortMode}
          setSortMode={setSortMode}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          openSelect={openSelect}
          setOpenSelect={setOpenSelect}
        />
      </div>

      {!hasItems ? (
        <p className="watchlist__empty">
          Tu watchlist está vacía. Empieza a añadir películas y series
          desde la Home o la sección de Series.
        </p>
      ) : (
        <div className="watchlist__grid">
          {processedItems!.map((item) => {
            const m = item.data;
            const year =
              (m.release_date || m.first_air_date || "").slice(0, 4);
            const title = m.title || m.name;
            const rating = m.vote_average
              ? m.vote_average.toFixed(1)
              : "—";

            const detailPath =
              item.kind === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`;

            return (
              <Link
                key={`${item.kind}-${item.id}`}
                to={detailPath}
                className="watchlist-card"
              >
                <div className="watchlist-card__frame">
                  {m.poster_path ? (
                    <img
                      className="watchlist-card__poster"
                      src={posterUrl(m.poster_path)}
                    />
                  ) : (
                    <div className="watchlist-card__poster watchlist-card__poster--empty" />
                  )}

                  <div className="watchlist-card__overlay">
                    <div className="watchlist-card__title">{title}</div>
                    <div className="watchlist-card__meta">
                      {year && <span>{year}</span>}
                      {rating !== "—" && (
                        <>
                          <span>·</span>
                          <span>⭐ {rating}</span>
                        </>
                      )}
                      <span>·</span>
                      <span className="watchlist-card__tag">
                        {item.kind === "movie" ? "PELÍCULA" : "SERIE"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


interface FiltersProps {
  sortMode: SortMode;
  setSortMode: (m: SortMode) => void;
  filterMode: FilterMode;
  setFilterMode: (m: FilterMode) => void;
  openSelect: OpenSelect;
  setOpenSelect: (s: OpenSelect) => void;
}

function WatchlistFilters({
  sortMode,
  setSortMode,
  filterMode,
  setFilterMode,
  openSelect,
  setOpenSelect,
}: FiltersProps) {
  const toggle = (which: OpenSelect) => {
    setOpenSelect(openSelect === which ? "none" : which);
  };

  return (
    <div className="watchlist__controls">
      <div className="watchlist__control">
        <span className="watchlist__label">Mostrar</span>
        <div className="watchlist-select">
          <button
            type="button"
            className="watchlist-select__button"
            onClick={() => toggle("filter")}
          >
            <span>{FILTER_LABELS[filterMode]}</span>
            <span className="watchlist-select__chevron">▾</span>
          </button>

          {openSelect === "filter" && (
            <div className="watchlist-select__menu">
              {(["all", "movie", "tv"] as FilterMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={
                    "watchlist-select__item" +
                    (filterMode === mode
                      ? " watchlist-select__item--active"
                      : "")
                  }
                  onClick={() => {
                    setFilterMode(mode);
                    setOpenSelect("none");
                  }}
                >
                  {FILTER_LABELS[mode]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="watchlist__control">
        <span className="watchlist__label">Ordenar por</span>
        <div className="watchlist-select">
          <button
            type="button"
            className="watchlist-select__button"
            onClick={() => toggle("sort")}
          >
            <span>{SORT_LABELS[sortMode]}</span>
            <span className="watchlist-select__chevron">▾</span>
          </button>

          {openSelect === "sort" && (
            <div className="watchlist-select__menu">
              {(["added", "title", "year"] as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={
                    "watchlist-select__item" +
                    (sortMode === mode
                      ? " watchlist-select__item--active"
                      : "")
                  }
                  onClick={() => {
                    setSortMode(mode);
                    setOpenSelect("none");
                  }}
                >
                  {SORT_LABELS[mode]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
