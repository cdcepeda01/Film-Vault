import { Link } from "react-router-dom";
import { posterUrl } from "../../lib/tmdb";
import type { TmdbMovie, TmdbSeries } from "../../lib/tmdb";

type Item = TmdbMovie | TmdbSeries;

interface ShelfProps {
  title: string;
  items: Item[];
  watchlistIds: number[];
  onToggleWatchlist?: (id: number) => void;
  userCanEdit?: boolean;
  kind?: "movie" | "tv"; 
}

export function Shelf({
  title,
  items,
  watchlistIds,
  onToggleWatchlist,
  userCanEdit = false,
  kind = "movie",
}: ShelfProps) {
  return (
    <section className="shelf">
      <h2 className="shelf__title">{title}</h2>

      <div className="shelf__scroller">
        {items.map((item: any) => {
          const inWatchlist = watchlistIds.includes(item.id);
          const href = kind === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`; 

          const titleText = item.title || item.name;
          const year =
            (item.release_date || item.first_air_date || "").slice(0, 4);

          return (
            <div key={item.id} className="shelf-card">
              <Link to={href}>
                {item.poster_path ? (
                  <img
                    src={posterUrl(item.poster_path, "w342")}
                    className="shelf-card__poster"
                  />
                ) : (
                  <div className="shelf-card__poster bg-gray-800" />
                )}

                <div className="shelf-card__overlay">
                  <div className="shelf-card__title">{titleText}</div>
                  <div className="shelf-card__meta">
                    {year && <span>{year}</span>}
                    {item.vote_average && (
                      <span>⭐ {item.vote_average.toFixed(1)}</span>
                    )}
                  </div>
                </div>
              </Link>

              {userCanEdit && onToggleWatchlist && (
                <button
                  type="button"
                  className={
                    "shelf-card__watch" +
                    (inWatchlist ? " shelf-card__watch--active" : "")
                  }
                  onClick={() => onToggleWatchlist(item.id)}
                >
                  {inWatchlist ? "✓" : "+"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
