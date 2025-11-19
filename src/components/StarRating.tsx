
interface StarRatingProps {
  value?: number;             // 0–max
  onChange?: (v: number) => void;
  max?: number;               // nº de estrellas (por defecto 5)
}

export default function StarRating({
  value = 0,
  onChange,
  max = 5,
}: StarRatingProps) {
  const handleClick = (v: number) => {
    if (!onChange) return;
    onChange(v);
  };

  return (
    <div className="flex items-center gap-1 text-yellow-400">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = starValue <= value;

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            className="text-lg md:text-xl"
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
