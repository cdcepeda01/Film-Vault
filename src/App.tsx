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
import { SiteFooter } from "./components/layout/SiteFooter";

function Layout() {
  const location = useLocation();

  const isLanding = location.pathname === "/";
  const isExplore = location.pathname === "/explore";

  const isHeroPage = isLanding || isExplore;

  return (
    <div className="fv-app-bg min-h-screen flex flex-col">
      <Header />

      <main className={`flex-1 ${isHeroPage ? "" : "pt-16"}`}>
        <Outlet />
      </main>

      <SiteFooter />
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

        {/* Series */}
        <Route path="series" element={<Series />} />
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

        {/* Rutas  */}
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
