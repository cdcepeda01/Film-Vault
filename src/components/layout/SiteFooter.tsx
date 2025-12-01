export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-red-900/60 bg-black/90 text-xs text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-white">
            FilmVault
          </div>
          <p className="text-[11px] text-gray-500">
            El lugar donde vive tu cine. 
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center text-[11px]">
          <span className="text-gray-600">
            © {year} FilmVault
          </span>
        </div>
      </div>
    </footer>
  );
}
