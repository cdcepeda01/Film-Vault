import { Link } from "react-router-dom";
import { posterUrl } from "../../lib/tmdb";

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

export type ShelfCardMovie = any;

interface ShelfCardProps {
  movie: ShelfCardMovie;
  inWatchlist: boolean;
  onToggleWatchlist: () => void;
  userCanEdit: boolean;
  kind?: "movie" | "tv";
  linkBasePath?: string;
}

export function ShelfCard({
  movie,
  inWatchlist,
  onToggleWatchlist,
  userCanEdit,
  kind = "movie",
  linkBasePath,
}: ShelfCardProps) {
  const year = (movie.release_date || movie.first_air_date || "").slice(0, 4);
  const avg = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  const genreId = movie.genre_ids?.[0];
  const genre =
    typeof genreId === "number" ? GENRE_LABELS[genreId] ?? "" : "";

  const base = linkBasePath ?? (kind === "tv" ? "/series" : "/movie");
  const href = `${base}/${movie.id}`;

  return (
    <div className="shelf-card">
      <Link to={href}>
        {movie.poster_path && (
          <img
            src={posterUrl(movie.poster_path, "w342")}
            className="shelf-card__poster"
          />
        )}

        <div className="shelf-card__overlay">
          <div className="shelf-card__title">
            {movie.title || movie.name}
          </div>

          <div className="shelf-card__meta">
            {year && <span>{year}</span>}
            {genre && <span>· {genre}</span>}
          </div>
        </div>
      </Link>

      {avg && <div className="shelf-card__badge">{avg}</div>}

      {userCanEdit && (
        <button
          type="button"
          className={
            "shelf-card__watch " +
            (inWatchlist ? "shelf-card__watch--active" : "")
          }
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleWatchlist();
          }}
        >
          {inWatchlist ? "✓" : "+"}
        </button>
      )}
    </div>
  );
}
