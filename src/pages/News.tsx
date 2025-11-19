// src/pages/News.tsx
import { useEffect, useState } from "react";
import { getNowPlaying, getUpcoming, getTrendingWeek, posterUrl } from "../lib/tmdb";

type Movie = any; // si ya tienes un tipo Movie úsalo aquí

export default function News() {
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [trending, setTrending] = useState<Movie[]>([]);

  useEffect(() => {
    (async () => {
      setNowPlaying(await getNowPlaying());
      setUpcoming(await getUpcoming());
      setTrending(await getTrendingWeek());
    })();
  }, []);

  const Section = ({
    title,
    items,
  }: {
    title: string;
    items: Movie[];
  }) => (
    <section className="mt-8">
      <h2 className="text-xl md:text-2xl font-semibold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {items.slice(0, 10).map((m) => (
          <div
            key={m.id}
            className="bg-black/60 rounded-lg overflow-hidden text-sm hover:-translate-y-1 hover:bg-black transition cursor-pointer"
          >
            {m.poster_path && (
              <img
                src={posterUrl(m.poster_path, "w342")}
                className="w-full aspect-[2/3] object-cover"
              />
            )}
            <div className="p-2">
              <div className="font-semibold line-clamp-2">{m.title}</div>
              <div className="text-[11px] text-gray-400 mt-1">
                {m.release_date?.slice(0, 4)} · ⭐ {m.vote_average?.toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold">Noticias de cine</h1>
      <p className="text-sm text-gray-300 mt-2">
        Estrenos recientes, próximos lanzamientos y lo más comentado de la semana.
      </p>

      <Section title="En cines ahora" items={nowPlaying} />
      <Section title="Próximos estrenos" items={upcoming} />
      <Section title="Tendencias de la semana" items={trending} />
    </div>
  );
}
