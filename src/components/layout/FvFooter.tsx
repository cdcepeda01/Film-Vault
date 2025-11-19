export default function FvFooter() {
  return (
    <footer className="fv-footer fv-animate-in-up">
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="font-semibold">Film Vault</div>
          <p className="opacity-70 mt-1">
            Descubre, califica y reseña películas. Crea tu watchlist y comparte tu gusto.
          </p>
        </div>
        <div>
          <div className="font-semibold">Enlaces</div>
          <ul className="mt-1 space-y-1 opacity-90">
            <li><a href="#/login" className="hover:underline">Únete</a></li>
            <li><a href="#/explore" className="hover:underline">Explorar</a></li>
            <li>
              <a
                href="https://github.com/cdcepeda01/Film-Vault"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Repositorio
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Legal</div>
          <ul className="mt-1 space-y-1 opacity-90">
            <li><a href="#" className="hover:underline">Términos</a></li>
            <li><a href="#" className="hover:underline">Privacidad</a></li>
          </ul>
        </div>
      </div>
    <div className="text-xs text-center opacity-60 pb-4">
        © {new Date().getFullYear()} Film Vault
      </div>
    </footer>
  );
}
