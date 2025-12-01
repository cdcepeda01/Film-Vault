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

export const posterUrl = (
  path?: string,
  size: "w342" | "w500" | "w780" = "w342"
) => (path ? `${TMDB_IMG_BASE_URL}${size}${path}` : "");


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

  const { data } = await api.get<TmdbPaginatedResponse<TmdbMovie>>(
    "/discover/movie",
    {
      params: {
        language: "es-ES",
        sort_by: "vote_average.desc",
        page: 1,
        primary_release_year: year,
        "vote_count.gte": 500,
      },
    }
  );

  return data.results;
};

export const getTopRatedClassics = async () => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbMovie>>(
    "/discover/movie",
    {
      params: {
        language: "es-ES",
        sort_by: "vote_average.desc",
        page: 1,
        "primary_release_date.lte": "1984-12-31",
        "vote_count.gte": 200,
      },
    }
  );

  return data.results;
};


export const getRecommendedByGenres = async (
  genreIds: number[],
  pages = 3
): Promise<TmdbMovie[]> => {
  if (!genreIds.length) return [];

  // Pedimos varias páginas en paralelo
  const requests: Promise<{ data: TmdbPaginatedResponse<TmdbMovie> }>[] = [];
  for (let p = 1; p <= pages; p++) {
    requests.push(
      api.get<TmdbPaginatedResponse<TmdbMovie>>("/discover/movie", {
        params: {
          language: "es-ES",
          sort_by: "popularity.desc",
          page: p,
          with_genres: genreIds.join(","), 
          include_adult: false,
          "vote_count.gte": 50, 
        },
      })
    );
  }

  const responses = await Promise.all(requests);

  const byId = new Map<number, TmdbMovie>();
  for (const { data } of responses) {
    for (const movie of data.results) {
      if (!byId.has(movie.id)) {
        byId.set(movie.id, movie);
      }
    }
  }

  return Array.from(byId.values());
};



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

export const getTrendingTvWeek = async (): Promise<TmdbSeries[]> => {
  const { data } = await api.get<TmdbPaginatedResponse<TmdbSeries>>(
    "/trending/tv/week",
    {
      params: { language: "es-ES" },
    }
  );
  return data.results;
};

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



export interface TmdbProviderInfo {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
}

export interface TmdbWatchRegion {
  link?: string;
  flatrate?: TmdbProviderInfo[];
  rent?: TmdbProviderInfo[];
  buy?: TmdbProviderInfo[];
}

export interface TmdbWatchProviders {
  [regionCode: string]: TmdbWatchRegion;
}

export interface NormalizedWatchProvider {
  providerId: number;
  providerName: string;
  logoPath: string | null;
}

export interface NormalizedWatchOptions {
  flatrate?: NormalizedWatchProvider[];
  rent?: NormalizedWatchProvider[];
  buy?: NormalizedWatchProvider[];
}

const REGION_PRIORITY = ["CO", "ES", "MX", "AR", "US", "BR"];

function pickRegionRegion(results: TmdbWatchProviders): TmdbWatchRegion | null {
  for (const code of REGION_PRIORITY) {
    if (results[code]) return results[code];
  }
  const firstKey = Object.keys(results)[0];
  return firstKey ? results[firstKey] : null;
}

function normalizeRegion(
  region: TmdbWatchRegion | null
): NormalizedWatchOptions | null {
  if (!region) return null;

  const mapList = (arr?: TmdbProviderInfo[]): NormalizedWatchProvider[] =>
    (arr ?? []).map((p) => ({
      providerId: p.provider_id,
      providerName: p.provider_name,
      logoPath: p.logo_path ?? null,
    }));

  const flatrate = mapList(region.flatrate);
  const rent = mapList(region.rent);
  const buy = mapList(region.buy);

  if (!flatrate.length && !rent.length && !buy.length) {
    return null;
  }

  return { flatrate, rent, buy };
}


export const getMovieProviders = async (
  id: number | string
): Promise<NormalizedWatchOptions | null> => {
  const { data } = await api.get(`/movie/${id}/watch/providers`);
  const results: TmdbWatchProviders = data.results ?? {};
  const region = pickRegionRegion(results);
  return normalizeRegion(region);
};


export const getTvProviders = async (
  id: number | string
): Promise<NormalizedWatchOptions | null> => {
  const { data } = await api.get(`/tv/${id}/watch/providers`);
  const results: TmdbWatchProviders = data.results ?? {};
  const region = pickRegionRegion(results);
  return normalizeRegion(region);
};
