interface ProfileTabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function ProfileTabButton({
  label,
  active,
  onClick,
}: ProfileTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-4 py-2 border-b-2 -mb-px transition text-xs md:text-sm " +
        (active
          ? "border-red-500 text-white"
          : "border-transparent text-gray-400 hover:text-gray-200 hover:border-red-700")
      }
    >
      {label}
    </button>
  );
}
