import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { getTvShow, posterUrl, getTvProviders } from "../lib/tmdb";
import StarRating from "../components/StarRating";
import { useAuth } from "../auth/useAuth";
import { auth } from "../lib/firebase";

import type { Review } from "../lib/reviews";
import { listenReviews, setUserReview } from "../lib/reviews";

import {
  listenWatchStatus,
  toggleWatchItem,
} from "../lib/watchlist";

type WatchProvider = {
  providerId: number;
  providerName: string;
  logoPath: string | null;
};

type WatchOptions = {
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
};

export default function Tv() {
  const { id } = useParams();
  const tid = Number(id);
  const { user } = useAuth();

  const [show, setShow] = useState<any | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [watchOptions, setWatchOptions] = useState<WatchOptions | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  const [draftRating, setDraftRating] = useState<number>(0);
  const [draftBody, setDraftBody] = useState("");
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    (async () => {
      if (!tid) return;
      setShow(await getTvShow(tid));
    })();
  }, [tid]);

  useEffect(() => {
    if (!user || !tid) {
      setInWatchlist(false);
      return;
    }

    const unsub = listenWatchStatus("tv", tid, user.id, (val) =>
      setInWatchlist(val)
    );

    return () => unsub();
  }, [user, tid]);

  useEffect(() => {
    if (!tid) return;

    const unsub = listenReviews("tv", tid, (items) => {
      setReviews(items);
    });

    return () => unsub();
  }, [tid]);

  useEffect(() => {
    (async () => {
      if (!tid) return;
      try {
        const opts = await getTvProviders(tid);
        setWatchOptions(opts);
      } catch (e) {
        console.error("Error cargando providers de TV:", e);
        setWatchOptions(null);
      }
    })();
  }, [tid]);

  const myReview: Review | undefined = user
    ? reviews.find((r) => r.userId === user.id)
    : undefined;

  const myRating = myReview?.rating;

  if (!show) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-white">
        Cargando…
      </div>
    );
  }

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  const year = (show.first_air_date || "").slice(0, 4);

  let runtime: string | null = null;
  if (Array.isArray(show.episode_run_time) && show.episode_run_time.length) {
    const minutes = show.episode_run_time[0];
    runtime = `${minutes} min por episodio`;
  }

  const genres = show.genres?.map((g: any) => g.name) ?? [];

  const creatorsFromField: any[] = Array.isArray(show.created_by)
    ? show.created_by
    : [];

  const creatorsFromCrew =
    show.credits?.crew?.filter((p: any) =>
      ["Creator", "Executive Producer", "Showrunner"].includes(p.job)
    ) ?? [];

  const mergedCreatorsMap = new Map<number, any>();
  creatorsFromField.forEach((c: any) => {
    if (c && c.id != null) mergedCreatorsMap.set(c.id, c);
  });
  creatorsFromCrew.forEach((c: any) => {
    if (c && c.id != null && !mergedCreatorsMap.has(c.id)) {
      mergedCreatorsMap.set(c.id, c);
    }
  });
  const creators = [...mergedCreatorsMap.values()] as any[];

  const mainCreator = creators[0];

  const castAll = show.credits?.cast ?? [];
  const topCast = castAll.slice(0, 5); 
  const castForGrid = castAll.slice(0, 12); 

  const seasons = Array.isArray(show.seasons)
    ? show.seasons.filter((s: any) => s && s.season_number !== 0)
    : [];

  const trailer =
    show.videos?.results?.find(
      (v: any) =>
        v.site === "YouTube" &&
        v.type === "Trailer" &&
        v.official
    ) ||
    show.videos?.results?.find(
      (v: any) => v.site === "YouTube" && v.type === "Trailer"
    );

  const backdrop =
    show.backdrop_path ||
    (show.images?.backdrops?.[0]?.file_path ?? null);

  const handleToggleWatchlist = async () => {
    if (!user || !tid) return;
    await toggleWatchItem("tv", tid, user.id);
  };

  const openReviewModal = () => {
    if (!user) return;
    setModalError("");
    setDraftRating(myRating ?? 0);
    setDraftBody(myReview?.body ?? "");
    setIsReviewModalOpen(true);
  };

  const handleSaveReviewAndRating = async () => {
    if (!user || !tid) return;

    if (!draftRating || draftRating <= 0) {
      setModalError("Primero selecciona una puntuación (al menos 1 estrella).");
      return;
    }

    const fbUser = auth.currentUser;

    const userName =
      fbUser?.displayName ||
      (fbUser?.email ? fbUser.email.split("@")[0] : "") ||
      "Usuario";

    const userPhotoUrl = fbUser?.photoURL ?? null;

    try {
      await setUserReview("tv", tid, {
        userId: user.id,
        userName,
        userPhotoUrl,
        rating: draftRating,
        body: draftBody.trim(),
      });

      setIsReviewModalOpen(false);
    } catch (e) {
      console.error(e);
      setModalError("No se pudo guardar tu reseña. Intenta de nuevo.");
    }
  };

  const hasAnyProviders =
    !!watchOptions &&
    (
      (watchOptions.flatrate?.length ?? 0) > 0 ||
      (watchOptions.rent?.length ?? 0) > 0 ||
      (watchOptions.buy?.length ?? 0) > 0
    );

  return (
    <div className="movie-page">
      <section className="movie-page__hero">
        {backdrop && (
          <div
            className="movie-page__hero-bg"
            style={{
              backgroundImage: `url(https://image.tmdb.org/t/p/original${backdrop})`,
            }}
          />
        )}

        <div className="movie-page__hero-overlay" />

        <div className="movie-page__hero-inner">
          <div className="movie-page__poster-wrapper">
            {show.poster_path && (
              <img
                src={posterUrl(show.poster_path, "w500")}
                className="movie-page__poster"
                alt={show.name}
              />
            )}
          </div>

          <div className="flex flex-col gap-3 md:gap-4">
            <div>
              <h1 className="movie-page__title">
                {show.name}{" "}
                {year && (
                  <span className="text-gray-300 font-normal">
                    ({year})
                  </span>
                )}
              </h1>

              <div className="movie-page__meta-line">
                {year && <span>{year}</span>}
                {runtime && <span>{runtime}</span>}
                {show.vote_average && (
                  <>
                    <span>⭐ {show.vote_average.toFixed(1)}</span>
                    {show.vote_count && (
                      <span>
                        {show.vote_count.toLocaleString()} votos
                      </span>
                    )}
                  </>
                )}
              </div>

              {genres.length > 0 && (
                <div className="movie-page__genres">
                  {genres.map((g: string) => (
                    <span key={g} className="movie-page__genre-pill">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {show.tagline && (
                <p className="movie-page__tagline mt-2">
                  “{show.tagline}”
                </p>
              )}

              <p className="movie-page__overview mt-2">
                {show.overview}
              </p>

              <p className="mt-3 text-xs text-gray-300">
                <span className="font-semibold text-gray-100">
                  Creador principal:
                </span>{" "}
                {mainCreator ? mainCreator.name : "—"}
              </p>
              {topCast.length > 0 && (
                <p className="mt-1 text-xs text-gray-300">
                  <span className="font-semibold text-gray-100">
                    Protagonizada por:
                  </span>{" "}
                  {topCast.map((c: any) => c.name).join(", ")}
                </p>
              )}
            </div>

            <div className="movie-page__actions">
              {trailer && (
                <button
                  type="button"
                  className="movie-page__play-btn"
                  onClick={() => setIsTrailerModalOpen(true)}
                >
                  ▶ Ver tráiler
                </button>
              )}

              {user && (
                <button
                  type="button"
                  onClick={handleToggleWatchlist}
                  className={
                    "movie-page__secondary-btn " +
                    (inWatchlist ? "border-yellow-400 text-yellow-300" : "")
                  }
                >
                  {inWatchlist
                    ? "✓ En tu Watchlist"
                    : "+ Añadir a Watchlist"}
                </button>
              )}

              <div className="flex flex-wrap gap-2">
                {user ? (
                  <>
                    <button
                      type="button"
                      className="movie-page__review-btn"
                      onClick={openReviewModal}
                    >
                      Reseñar o calificar
                    </button>
                    <button
                      type="button"
                      className="movie-page__ghost-btn"
                      onClick={() => setIsReviewsModalOpen(true)}
                    >
                      Leer reseñas
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-300">
                    Inicia sesión para puntuar y leer reseñas.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="movie-page__body">
        <section className="movie-page__details-grid">
          <div className="space-y-3">
            <InfoRow label="Género">
              {genres.length ? genres.join(", ") : "—"}
            </InfoRow>
            <InfoRow label="Creadores">
              {creators.length
                ? creators.map((c: any) => c.name).join(" • ")
                : "—"}
            </InfoRow>
            <InfoRow label="Reparto principal">
              {topCast.length
                ? topCast.map((c: any) => c.name).join(" • ")
                : "—"}
            </InfoRow>
            <InfoRow label="Estado">
              {show.status || "—"}
            </InfoRow>
          </div>

          <div className="space-y-3">
            <InfoRow label="Primera emisión">
              {show.first_air_date || "—"}
            </InfoRow>
            <InfoRow label="Última emisión">
              {show.last_air_date || "—"}
            </InfoRow>
            <InfoRow label="Temporadas">
              {show.number_of_seasons ?? "—"}
            </InfoRow>
            <InfoRow label="Episodios">
              {show.number_of_episodes ?? "—"}
            </InfoRow>
          </div>
        </section>

        {hasAnyProviders && (
          <section className="mt-10">
            <h2 className="movie-page__section-title">Dónde ver</h2>

            <div className="space-y-4 text-sm">
              {watchOptions?.flatrate?.length ? (
                <div>
                  <p className="text-gray-300 mb-1 uppercase tracking-[0.16em] text-xs">
                    Suscripción
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {watchOptions.flatrate.map((p) => (
                      <div
                        key={p.providerId}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-xs rounded-full"
                      >
                        {p.logoPath && (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
                            alt={p.providerName}
                            className="w-6 h-6 rounded"
                          />
                        )}
                        <span>{p.providerName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {watchOptions?.rent?.length ? (
                <div>
                  <p className="text-gray-300 mb-1 uppercase tracking-[0.16em] text-xs">
                    Alquiler digital
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {watchOptions.rent.map((p) => (
                      <div
                        key={p.providerId}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-xs rounded-full"
                      >
                        {p.logoPath && (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
                            alt={p.providerName}
                            className="w-6 h-6 rounded"
                          />
                        )}
                        <span>{p.providerName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {watchOptions?.buy?.length ? (
                <div>
                  <p className="text-gray-300 mb-1 uppercase tracking-[0.16em] text-xs">
                    Compra digital
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {watchOptions.buy.map((p) => (
                      <div
                        key={p.providerId}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-xs rounded-full"
                      >
                        {p.logoPath && (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${p.logoPath}`}
                            alt={p.providerName}
                            className="w-6 h-6 rounded"
                          />
                        )}
                        <span>{p.providerName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {castForGrid.length > 0 && (
          <section className="shelf mt-10">
            <h2 className="shelf__title">Reparto principal</h2>

            <div className="shelf__scroller">
              {castForGrid.map((person: any) => (
                <div key={person.id} className="shelf-card">
                  {person.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                      alt={person.name}
                      className="shelf-card__poster"
                    />
                  ) : (
                    <div className="shelf-card__poster bg-gray-800 flex items-center justify-center text-[11px] text-gray-500">
                      Sin foto
                    </div>
                  )}

                  <div className="shelf-card__overlay">
                    <div className="shelf-card__title">
                      {person.name}
                    </div>
                    <div className="shelf-card__meta">
                      {person.character && (
                        <span>como {person.character}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {seasons.length > 0 && (
          <section className="shelf mt-10">
            <h2 className="shelf__title">Temporadas</h2>

            <div className="shelf__scroller">
              {seasons.map((season: any) => (
                <div
                  key={season.id ?? season.season_number}
                  className="shelf-card"
                >
                  {season.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${season.poster_path}`}
                      alt={season.name}
                      className="shelf-card__poster"
                    />
                  ) : (
                    <div className="shelf-card__poster bg-gray-800 flex items-center justify-center text-[11px] text-gray-500">
                      Sin póster
                    </div>
                  )}

                  <div className="shelf-card__overlay">
                    <div className="shelf-card__title">
                      {season.name}
                    </div>
                    <div className="shelf-card__meta">
                      {typeof season.episode_count === "number" && (
                        <span>{season.episode_count} episodios</span>
                      )}
                      {season.air_date && (
                        <span>
                          {" "}
                          · {String(season.air_date).slice(0, 4)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* =====RESEÑA/CALIFICACIÓN ===== */}
      {user && isReviewModalOpen && (
        <div className="movie-modal-backdrop">
          <div className="movie-modal">
            <div className="movie-modal__header">
              <h2 className="movie-modal__title">
                Reseñar y calificar — {show.name}{" "}
                {year && (
                  <span className="movie-modal__year">({year})</span>
                )}
              </h2>
              <button
                type="button"
                className="movie-modal__close"
                onClick={() => setIsReviewModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <span className="movie-modal__field-label">
                Tu puntuación
              </span>
              <StarRating
                value={draftRating}
                onChange={(v: number) => {
                  setDraftRating(v);
                  setModalError("");
                }}
              />
            </div>

            <div>
              <span className="movie-modal__field-label">
                Reseña (opcional)
              </span>
              <textarea
                className="movie-modal__textarea"
                rows={5}
                value={draftBody}
                onChange={(e) => {
                  setDraftBody(e.target.value);
                  setModalError("");
                }}
                placeholder="Cuéntanos qué te pareció la serie…"
              />
              {modalError && (
                <p className="text-xs text-red-400 mt-1">
                  {modalError}
                </p>
              )}
            </div>

            <div className="movie-modal__footer">
              <button
                type="button"
                className="movie-modal__secondary"
                onClick={() => setIsReviewModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="movie-modal__primary"
                onClick={handleSaveReviewAndRating}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LEER RESEÑAS ===== */}
      {user && isReviewsModalOpen && (
        <div className="movie-modal-backdrop">
          <div
            className="
              w-full max-w-3xl
              bg-black border border-red-800
              p-5 md:p-6
              shadow-[0_25px_80px_rgba(0,0,0,1)]
            "
            style={{ borderRadius: 0 }}
          >
            <div className="flex items-center justify-between mb-4 border-b border-red-900 pb-2">
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  Reseñas — {show.name}
                </h2>
                {avgRating !== null && (
                  <p className="text-xs text-gray-400 mt-1">
                    Puntuación media{" "}
                    <span className="text-yellow-400 font-semibold">
                      {avgRating.toFixed(1)}/5
                    </span>{" "}
                    · {reviews.length}{" "}
                    {reviews.length === 1 ? "reseña" : "reseñas"}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="movie-modal__close"
                onClick={() => setIsReviewsModalOpen(false)}
              >
                ×
              </button>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-400">
                Todavía no hay reseñas para esta serie.
              </p>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                {reviews.map((r) => {
                  const displayName = r.userName || "Usuario";
                  const initials = displayName
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div
                      key={r.id}
                      className="border border-red-900/50 bg-black/70 px-3 py-3 flex gap-3"
                      style={{ borderRadius: 0 }}
                    >
                      <div className="flex flex-col items-center gap-1 w-16">
                        {r.userPhotoUrl ? (
                          <img
                            src={r.userPhotoUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-full object-cover border border-red-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-red-800/70 flex items-center justify-center text-xs font-semibold">
                            {initials}
                          </div>
                        )}
                        <span className="text-[10px] text-gray-300 text-center line-clamp-2">
                          {displayName}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400 text-sm">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i}>
                                  {i < Math.round(r.rating) ? "★" : "☆"}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {r.rating.toFixed(1)}/5
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500">
                            {r.createdAt.toLocaleString()}
                          </span>
                        </div>

                        {r.body && (
                          <p className="text-sm mt-1 text-gray-200">
                            {r.body}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TRÁILER ===== */}
      {isTrailerModalOpen && trailer && (
        <div className="movie-modal-backdrop">
          <div className="movie-modal max-w-4xl">
            <div className="movie-modal__header">
              <h2 className="movie-page__title">
                Tráiler — {show.name}
              </h2>
              <button
                type="button"
                className="movie-modal__close"
                onClick={() => setIsTrailerModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="movie-modal__trailer-frame">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-28 text-xs uppercase tracking-[0.18em] text-gray-400">
        {label}
      </div>
      <div className="flex-1 text-sm text-gray-100">{children}</div>
    </div>
  );
}
