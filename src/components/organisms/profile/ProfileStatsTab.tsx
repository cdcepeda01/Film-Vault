type UserRating = {
  movieId: number;
  stars: number;
  createdAt: Date;
};

interface ProfileStatsTabProps {
  totalMoviesRated: number;
  totalReviews: number;
  totalWatchlist: number;
  avgRating: string;
  topGenres: [string, number][];
  ratings?: UserRating[];
}

export function ProfileStatsTab({
  totalMoviesRated,
  totalReviews,
  totalWatchlist,
  avgRating,
  topGenres,
  ratings,
}: ProfileStatsTabProps) {
  const safeRatings = ratings ?? [];

  const buckets = [5, 4, 3, 2, 1].map((star) => {
    const count = safeRatings.filter(
      (r) => Math.round(r.stars) === star
    ).length;
    return { star, count };
  });
  const maxCount =
    buckets.reduce((m, b) => Math.max(m, b.count), 0) || 1;

  const yearCount: Record<number, number> = {};
  safeRatings.forEach((r) => {
    const year = r.createdAt.getFullYear();
    yearCount[year] = (yearCount[year] ?? 0) + 1;
  });
  const yearEntries = Object.entries(yearCount).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );

  return (
    <section className="grid md:grid-cols-2 gap-4 text-xs md:text-sm">
      {/* Resumen general */}
      <div className="bg-black/80 border border-red-900/60 p-4 space-y-1">
        <h3 className="font-semibold mb-1">Resumen general</h3>
        <p className="text-gray-300">
          Películas calificadas:{" "}
          <span className="font-semibold">
            {totalMoviesRated}
          </span>
        </p>
        <p className="text-gray-300">
          Reseñas escritas:{" "}
          <span className="font-semibold">
            {totalReviews}
          </span>
        </p>
        <p className="text-gray-300">
          En tu Watchlist:{" "}
          <span className="font-semibold">
            {totalWatchlist}
          </span>
        </p>
        <p className="text-gray-300">
          Nota media:{" "}
          <span className="font-semibold">
            {avgRating !== "—" ? `${avgRating} / 5` : "—"}
          </span>
        </p>
      </div>

      {/* Géneros favoritos */}
      <div className="bg-black/80 border border-red-900/60 p-4">
        <h3 className="font-semibold mb-2">
          Géneros favoritos
        </h3>
        {topGenres.length === 0 ? (
          <p className="text-gray-500 text-xs">
            Aún no hay suficientes datos de géneros.
          </p>
        ) : (
          <ul className="space-y-2">
            {topGenres.map(([name, count]) => (
              <li
                key={name}
                className="flex items-center justify-between"
              >
                <span className="text-gray-200">{name}</span>
                <span className="text-gray-400 text-xs">
                  {count} títulos
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Distribución de notas */}
      <div className="bg-black/80 border border-red-900/60 p-4">
        <h3 className="font-semibold mb-2">
          Distribución de tus notas
        </h3>
        {totalMoviesRated === 0 ? (
          <p className="text-gray-500 text-xs">
            Aún no has calificado películas.
          </p>
        ) : (
          <ul className="space-y-1 mt-1">
            {buckets.map((b) => (
              <li
                key={b.star}
                className="flex items-center gap-2"
              >
                <span className="w-8 text-[11px] text-gray-300">
                  {b.star}★
                </span>
                <div className="flex-1 h-2 bg-white/5">
                  <div
                    className="h-2 bg-red-600"
                    style={{
                      width: `${(b.count / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-[11px] text-gray-400 text-right">
                  {b.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Actividad por año */}
      <div className="bg-black/80 border border-red-900/60 p-4">
        <h3 className="font-semibold mb-2">
          Actividad por año
        </h3>
        {yearEntries.length === 0 ? (
          <p className="text-gray-500 text-xs">
            Aún no has registrado calificaciones.
          </p>
        ) : (
          <ul className="space-y-1 mt-1">
            {yearEntries.map(([year, count]) => (
              <li
                key={year}
                className="flex items-center justify-between"
              >
                <span className="text-gray-200">{year}</span>
                <span className="text-gray-400 text-xs">
                  {count} calificaciones
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
