import { posterUrl, type TmdbMovie, type TmdbSeries } from "../../../lib/tmdb";
import type { Review as FirestoreReview } from "../../../lib/reviews";

type Review = FirestoreReview;

interface ProfileReviewsTabProps {
  reviews: Review[];
  movieById: Map<number, TmdbMovie>;
  tvById: Map<number, TmdbSeries>;
}

export function ProfileReviewsTab({
  reviews,
  movieById,
  tvById,
}: ProfileReviewsTabProps) {
  const sorted = reviews
    .filter((r) => r.body && r.body.trim() !== "")
    .sort(
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
        const media =
          r.kind === "movie"
            ? movieById.get(r.refId)
            : tvById.get(r.refId);

        const year = (
          (media as any)?.release_date ||
          (media as any)?.first_air_date ||
          ""
        ).slice(0, 4);

        const title =
          (media as any)?.title ||
          (media as any)?.name ||
          (r.kind === "movie" ? "Película" : "Serie");

        return (
          <div
            key={r.id}
            className="flex gap-3 bg-black/80 border border-red-900/60 p-3"
          >
            <div className="w-12 sm:w-16 flex-shrink-0 bg-gray-800 overflow-hidden">
              {media && (media as any).poster_path && (
                <img
                  src={posterUrl((media as any).poster_path, "w342")}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-xs md:text-sm flex-1">
              <div className="font-semibold flex items-center gap-2">
                <span>
                  {title}
                  {year && (
                    <span className="text-gray-400 font-normal">
                      {" "}
                      ({year})
                    </span>
                  )}
                </span>
                <span className="text-[11px] bg-yellow-500 text-black px-1.5 py-[1px] font-semibold">
                  ★ {r.rating.toFixed(1)}
                </span>
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
