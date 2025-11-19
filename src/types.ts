export type User = { id: string; username: string; avatarUrl?: string };
export type Review = { id: string; userId: string; movieId: number; title: string; body: string; spoiler: boolean; createdAt: string };
export type Rating = { userId: string; movieId: number; stars: number; createdAt: string };
