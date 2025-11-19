// src/components/organisms/Shelf.tsx
import { ShelfCard } from "../molecules/ShelfCard";
import type { ShelfCardMovie } from "../molecules/ShelfCard";

interface ShelfProps {
  title: string;
  items: ShelfCardMovie[];
  watchlistIds: number[];
  onToggleWatchlist: (id: number) => void;
  userCanEdit: boolean;
  kind?: "movie" | "tv";
  linkBasePath?: string;
}

export function Shelf({
  title,
  items,
  watchlistIds,
  onToggleWatchlist,
  userCanEdit,
  kind = "movie",
  linkBasePath,
}: ShelfProps) {
  if (!items || !items.length) return null;

  return (
    <section className="shelf">
      <h2 className="shelf__title">{title}</h2>

      <div className="shelf__scroller">
        {items.slice(0, 20).map((m) => (
          <ShelfCard
            key={m.id}
            movie={m}
            inWatchlist={watchlistIds.includes(m.id)}
            onToggleWatchlist={() => onToggleWatchlist(m.id)}
            userCanEdit={userCanEdit}
            kind={kind}
            linkBasePath={linkBasePath}
          />
        ))}
      </div>
    </section>
  );
}
