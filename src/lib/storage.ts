import type { Review, Rating, User } from "../types";

const key = (k: string) => `cinebox:${k}`;


export const saveUser = (u: User | null) =>
  localStorage.setItem(key("user"), JSON.stringify(u));

export const getUser = (): User | null =>
  JSON.parse(localStorage.getItem(key("user")) || "null");



export const getWatchlist = (uid: string): number[] =>
  JSON.parse(localStorage.getItem(key(`wl:${uid}`)) || "[]");

export const toggleWatch = (uid: string, movieId: number) => {
  const wl = new Set(getWatchlist(uid));
  wl.has(movieId) ? wl.delete(movieId) : wl.add(movieId);
  localStorage.setItem(key(`wl:${uid}`), JSON.stringify([...wl]));
};


export const getWatchlistSeries = (uid: string): number[] =>
  JSON.parse(localStorage.getItem(key(`wlSeries:${uid}`)) || "[]");

export const toggleWatchSeries = (uid: string, showId: number) => {
  const wl = new Set(getWatchlistSeries(uid));
  wl.has(showId) ? wl.delete(showId) : wl.add(showId);
  localStorage.setItem(key(`wlSeries:${uid}`), JSON.stringify([...wl]));
};



export const getRatings = (uid: string): Rating[] =>
  JSON.parse(localStorage.getItem(key(`rt:${uid}`)) || "[]");

export const setRating = (uid: string, r: Rating) => {
  const arr = getRatings(uid).filter((x) => x.movieId !== r.movieId);
  arr.push(r);
  localStorage.setItem(key(`rt:${uid}`), JSON.stringify(arr));
};



export const getAllReviews = (): Review[] =>
  JSON.parse(localStorage.getItem(key("reviews")) || "[]");

export const addReview = (rv: Review) => {
  const arr = getAllReviews();
  arr.push(rv);
  localStorage.setItem(key("reviews"), JSON.stringify(arr));
};

export const getMovieReviews = (movieId: number) =>
  getAllReviews()
    .filter((r) => r.movieId === movieId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));


const likeKey = (uid: string) => `cinebox:reviewlikes:${uid}`;

export const getReviewLikes = (uid: string): string[] =>
  JSON.parse(localStorage.getItem(likeKey(uid)) || "[]");

export const toggleReviewLike = (uid: string, reviewId: string) => {
  const set = new Set(getReviewLikes(uid));
  set.has(reviewId) ? set.delete(reviewId) : set.add(reviewId);
  localStorage.setItem(likeKey(uid), JSON.stringify([...set]));
};

export const getReviewLikeCount = (reviewId: string): number =>
  Number(localStorage.getItem(`cinebox:reviewlikecount:${reviewId}`) || "0");

export const bumpReviewLikeCount = (reviewId: string, inc: number) => {
  const n = Math.max(0, getReviewLikeCount(reviewId) + inc);
  localStorage.setItem(`cinebox:reviewlikecount:${reviewId}`, String(n));
};
