interface ProfileAvatarProps {
  photoUrl?: string | null;
  letter: string; 
}

export function ProfileAvatar({ photoUrl, letter }: ProfileAvatarProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={letter}
        className="w-14 h-14 object-cover bg-black border border-red-700"
      />
    );
  }

  return (
    <div className="w-14 h-14 bg-red-700 flex items-center justify-center text-xl font-bold">
      {letter}
    </div>
  );
}
