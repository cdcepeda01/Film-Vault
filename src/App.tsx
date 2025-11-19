// src/App.tsx
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Movie from "./pages/Movie";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import Series from "./pages/Series";
import { useAuth } from "./auth/useAuth";
import Header from "./components/layout/Header";

function Layout() {
  const location = useLocation();

  const isLanding = location.pathname === "/";
  const isExplore = location.pathname === "/explore";
  // Páginas cuyo contenido arranca justo debajo del header transparente
  const isHeroPage = isLanding || isExplore;

  return (
    <div className="fv-app-bg min-h-screen">
      <Header />
      {/* En landing y explore NO damos padding-top.
          En el resto sí para que el header fijo no tape el contenido. */}
      <main className={isHeroPage ? "" : "pt-16"}>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Landing como home */}
        <Route index element={<Landing />} />

        {/* Películas */}
        <Route path="explore" element={<Home />} />

        {/* Series */}
        <Route path="series" element={<Series />} />

        {/* Detalle de película */}
        <Route path="movie/:id" element={<Movie />} />

        {/* Auth y usuario */}
        <Route
          path="login"
          element={user ? <Navigate to="/explore" /> : <Login />}
        />
        <Route
          path="me"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="watchlist"
          element={user ? <Watchlist /> : <Navigate to="/login" />}
        />
      </Route>
    </Routes>
  );
}
