// src/App.tsx
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Movie from "./pages/Movie";
import Profile from "./pages/Profile";
import Watchlist from "./pages/Watchlist";
import Series from "./pages/Series";
import Tv from "./pages/Tv";
import { useAuth } from "./auth/useAuth";
import Header from "./components/layout/Header";
import { SiteFooter } from "./components/layout";

function Layout() {
  const location = useLocation();

  const isLanding = location.pathname === "/";
  const isExplore = location.pathname === "/explore";

  // Páginas donde el contenido arranca “pegado” al header
  const isHeroPage = isLanding || isExplore;

  return (
    <div className="fv-app-bg min-h-screen flex flex-col">
      <Header />

      <main className={`${isHeroPage ? "" : "pt-16"} flex-1`}>
        <Outlet />
      </main>

      {/* 👇 Usamos el footer global en todo menos en el landing */}
      {!isLanding && <SiteFooter />}
    </div>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Landing */}
        <Route index element={<Landing />} />

        {/* Películas */}
        <Route path="explore" element={<Home />} />
        <Route path="movie/:id" element={<Movie />} />

        {/* Series (listado + detalle) */}
        <Route path="series" element={<Series />} />
        {/* Detalle de serie: aceptamos /tv/:id y /series/:id */}
        <Route path="tv/:id" element={<Tv />} />
        <Route path="series/:id" element={<Tv />} />

        {/* Auth */}
        <Route
          path="login"
          element={user ? <Navigate to="/explore" /> : <Login />}
        />
        <Route
          path="signup"
          element={user ? <Navigate to="/explore" /> : <Signup />}
        />

        {/* Rutas protegidas */}
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
