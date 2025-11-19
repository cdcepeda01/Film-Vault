// src/components/layout/Header.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { searchMovies } from "../../lib/tmdb";

// 👉 importa los assets desde src/assets
import logoMain from "../../assets/filmvault-logo.png";
import logoRed from "../../assets/filmvault-logo-red.png";
import logoutIcon from "../../assets/logout-icon.png";

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLanding = location.pathname === "/";
  const isLogin = location.pathname === "/login";

  // 👇 Elegimos el logo según la sección (ahora usando los imports)
  const logoSrc = isLanding || isLogin ? logoMain : logoRed;

  const [hidden, setHidden] = useState(false);

  // Ocultar al hacer scroll hacia abajo
  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastY && current > 50) setHidden(true);
      else setHidden(false);
      lastY = current;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ===== BUSCADOR =====
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const typingTimeoutRef = useRef<number | null>(null);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // debounce
    if (typingTimeoutRef.current !== null) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(async () => {
      const res = await searchMovies(value);
      setSuggestions(res.results?.slice(0, 5) ?? []);
      setShowSuggestions(true);
    }, 250);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/explore?query=${encodeURIComponent(q)}`);
    setShowSuggestions(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className={`fv-header ${hidden ? "fv-header--hidden" : ""}`}>
      <div className="fv-header__inner">
        {/* LOGO */}
        <Link to={user ? "/explore" : "/"} className="fv-header__logo">
          <img
            src={logoSrc}
            alt="Film Vault"
            className="fv-header__logo-image"
          />
        </Link>

        {/* LOGIN: solo logo */}
        {isLogin ? (
          <div className="fv-header__spacer" />
        ) : isLanding ? (
          <>
            <div className="fv-header__spacer" />
            {!user && (
              <Link
                to="/login"
                className="fv-header__menu-link fv-header__menu-link--primary"
              >
                Iniciar sesión
              </Link>
            )}
          </>
        ) : (
          <>
            {/* MENÚ IZQUIERDO */}
            <div className="fv-header__menu">
              <Link
                to="/explore"
                className="fv-header__menu-link fv-header__menu-link--primary"
              >
                Películas
              </Link>

              <Link to="/series" className="fv-header__menu-link">
                Series
              </Link>

              <Link to="/watchlist" className="fv-header__menu-link">
                Watchlist
              </Link>
            </div>

            {/* BUSCADOR ESTILO NETFLIX */}
            <div className="fv-search">
              <form onSubmit={handleSearchSubmit} className="fv-search__field">
                <span className="fv-search__icon">⌕</span>
                <input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Buscar…"
                  className="fv-search__input"
                  onFocus={() => query && setShowSuggestions(true)}
                />
              </form>

              {showSuggestions && suggestions.length > 0 && (
                <div className="fv-search__panel">
                  {suggestions.map((m) => (
                    <div
                      key={m.id}
                      className="fv-search__item"
                      onClick={() => {
                        navigate(`/movie/${m.id}`);
                        setQuery("");
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                    >
                      {m.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                          className="fv-search__thumb"
                        />
                      ) : (
                        <div className="fv-search__thumb" />
                      )}

                      <div>
                        <div className="fv-search__title">{m.title}</div>
                        {m.release_date && (
                          <div className="fv-search__year">
                            {m.release_date.slice(0, 4)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="fv-header__spacer" />

            {/* USUARIO */}
            {user ? (
              <div className="fv-header__user">
                <Link to="/me" className="fv-header__avatar-wrapper">
                  {user.avatarUrl && (
                    <img
                      src={user.avatarUrl}
                      className="fv-header__avatar"
                    />
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                  className="fv-header__logout"
                >
                  <img
                    src={logoutIcon}
                    className="w-5 h-5"
                    alt="logout"
                  />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="fv-header__menu-link fv-header__menu-link--primary"
              >
                Iniciar sesión
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
