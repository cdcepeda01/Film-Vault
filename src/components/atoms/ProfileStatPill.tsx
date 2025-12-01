interface ProfileStatPillProps {
  label: string;
  value: number | string;
}

export function ProfileStatPill({ label, value }: ProfileStatPillProps) {
  return (
    <div className="px-3 py-2 bg-black/80 border border-red-900/70 min-w-[80px] text-center">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
