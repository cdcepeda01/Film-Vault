// src/lib/tmdb.ts
import axios from "axios";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMG_BASE_URL = "https://image.tmdb.org/t/p/";

if (!import.meta.env.VITE_TMDB_TOKEN) {
  console.warn("⚠️ Falta VITE_TMDB_TOKEN en las variables de entorno.");
}

export const api = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}`,
    "Content-Type": "application/json;charset=utf-8",
  },
});

/* =========================
   Tipos básicos
   ========================= */

export interface TmdbMovie {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
}

export interface TmdbSeries {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
}

export interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/* =========================
   Funciones generales
   ========================= */

// Películas populares (lista principal)
export const getPopular = async (
  page = 1
): Promise<TmdbPaginatedResponse<TmdbMovie>> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/popular",
    {
      params: { page, language: "es-ES" },
    }
  );
  return data;
};

// Búsqueda de películas
export const searchMovies = async (
  q: string,
  page = 1
): Promise<TmdbPaginatedResponse<TmdbMovie>> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbMovie>>(
    "/search/movie",
    {
      params: {
        query: q,
        page,
        language: "es-ES",
        include_adult: false,
      },
    }
  );
  return data;
};

// Detalle de película
export const getMovie = async (id: number | string): Promise<any> => {
  const { data } = await api.get(`/movie/${id}`, {
    params: {
      append_to_response: "credits,images,videos",
      language: "es-ES",
      include_image_language: "es,en,null",
    },
  });
  return data;
};

// Obtener varias películas por id (para watchlist, etc.)
export const getManyMovies = async (ids: number[]): Promise<TmdbMovie[]> => {
  const jobs = ids.map((id) =>
    api.get(`/movie/${id}`, {
      params: { language: "es-ES" },
    })
  );
  const res = await Promise.allSettled(jobs);
  return res
    .filter((r) => r.status === "fulfilled")
    .map((r: any) => r.value.data as TmdbMovie);
};

// 🔹 Obtener varias SERIES por id
export const getManySeries = async (ids: number[]): Promise<TmdbSeries[]> => {
  const jobs = ids.map((id) =>
    api.get(`/tv/${id}`, {
      params: { language: "es-ES" },
    })
  );
  const res = await Promise.allSettled(jobs);
  return res
    .filter((r) => r.status === "fulfilled")
    .map((r: any) => r.value.data as TmdbSeries);
};

// Construir URL de póster
export const posterUrl = (
  path?: string,
  size: "w342" | "w500" | "w780" = "w342"
) => (path ? `${TMDB_IMG_BASE_URL}${size}${path}` : "");

/* =========================
   Pelis "noticias" / listados
   ========================= */

export const getNowPlaying = async (): Promise<TmdbMovie[]> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/now_playing",
    {
      params: { language: "es-ES", page: 1, region: "ES" },
    }
  );
  return data.results;
};

export const getUpcoming = async (): Promise<TmdbMovie[]> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/upcoming",
    {
      params: { language: "es-ES", page: 1, region: "ES" },
    }
  );
  return data.results;
};

export const getTrendingWeek = async (): Promise<TmdbMovie[]> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbMovie>>(
    "/trending/movie/week",
    {
      params: { language: "es-ES" },
    }
  );
  return data.results;
};

export const getTopRated = async (): Promise<TmdbMovie[]> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/top_rated",
    {
      params: { language: "es-ES", page: 1 },
    }
  );
  return data.results;
};

export const getTopRatedThisYear = async () => {
  const year = new Date().getFullYear();

  const { data } = await api.get("/discover/movie", {
    params: {
      language: "es-ES",
      sort_by: "vote_average.desc",
      page: 1,
      primary_release_year: year,
      "vote_count.gte": 500,
    },
  });

  return data.results;
};

export const getTopRatedClassics = async () => {
  const { data } = await api.get("/discover/movie", {
    params: {
      language: "es-ES",
      sort_by: "vote_average.desc",
      page: 1,
      "primary_release_date.lte": "1999-12-31",
      "vote_count.gte": 200,
    },
  });

  return data.results;
};

/* =========================
   SERIES
   ========================= */

export const getSeriesOnTheAir = async (): Promise<TmdbSeries[]> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbSeries>>(
    "/tv/on_the_air",
    {
      params: { language: "es-ES", page: 1 },
    }
  );
  return data.results;
};

export const getPopularSeries = async (): Promise<TmdbSeries[]> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbSeries>>(
    "/tv/popular",
    {
      params: { language: "es-ES", page: 1 },
    }
  );
  return data.results;
};

export const getTopRatedSeries = async (): Promise<TmdbSeries[]> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbSeries>>(
    "/tv/top_rated",
    {
      params: { language: "es-ES", page: 1 },
    }
  );
  return data.results;
};
// src/lib/tmdb.ts
// ...lo que ya tienes arriba

export const getTvShow = async (id: number | string): Promise<any> => {
  const { data } = await api.get(`/tv/${id}`, {
    params: {
      append_to_response: "credits,images,videos",
      language: "es-ES",
      include_image_language: "es,en,null",
    },
  });
  return data;
};
