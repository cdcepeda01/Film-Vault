// src/components/molecules/ProfileHeader.tsx
import { ProfileAvatar } from "../atoms/ProfileAvatar";
import { ProfileStatPill } from "../atoms/ProfileStatPill";

interface ProfileHeaderProps {
  rawName: string;
  firstLetter: string;
  photoUrl: string | null;
  totalMoviesRated: number;
  totalReviews: number;
  totalWatchlist: number;
}

export function ProfileHeader({
  rawName,
  firstLetter,
  photoUrl,
  totalMoviesRated,
  totalReviews,
  totalWatchlist,
}: ProfileHeaderProps) {
  return (
    <header className="profile__header flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        <ProfileAvatar photoUrl={photoUrl} letter={firstLetter} />
        <div>
          <h1 className="text-2xl font-semibold">@{rawName}</h1>
          <p className="text-sm text-gray-400">
            Tu actividad en FilmVault
          </p>
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        <ProfileStatPill label="Películas" value={totalMoviesRated} />
        <ProfileStatPill label="Reseñas" value={totalReviews} />
        <ProfileStatPill label="Watchlist" value={totalWatchlist} />
      </div>
    </header>
  );
}
