import axios from "axios";

export const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` }
});

export const getPopular = async (page=1) => {
  const { data } = await api.get("/movie/popular", { params:{ page } });
  return data;
};

export const searchMovies = async (q: string, page=1) => {
  const { data } = await api.get("/search/movie", { params:{ query:q, page } });
  return data;
};

export const posterUrl = (path?: string, size: "w342"|"w500"="w342") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";
