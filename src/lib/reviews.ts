// src/lib/reviews.ts
import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";

export type ReviewKind = "movie" | "tv";

export type Review = {
  id: string;
  kind: ReviewKind;
  refId: number;        
  userId: string;
  userName: string;
  userPhotoUrl: string | null;
  rating: number;       
  body: string;         
  createdAt: Date;
};

function reviewsCollection() {
  return collection(db, "reviews");
}

function buildReviewId(kind: ReviewKind, refId: number, userId: string) {
  return `${kind}_${refId}_${userId}`;
}


export function listenReviews(
  kind: ReviewKind,
  refId: number,
  cb: (reviews: Review[]) => void
) {
  const q = query(
    reviewsCollection(),
    where("kind", "==", kind),
    where("refId", "==", refId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const items: Review[] = snapshot.docs.map((snap) => {
      const d = snap.data() as DocumentData;
      return {
        id: snap.id,
        kind: d.kind as ReviewKind,
        refId: d.refId as number,
        userId: d.userId as string,
        userName: (d.userName as string) ?? "Usuario anónimo",
        userPhotoUrl:
          (d.userPhotoUrl as string | null | undefined) ?? null,
        rating: d.rating as number,
        body: (d.body as string) ?? "",
        createdAt: d.createdAt?.toDate() ?? new Date(),
      };
    });

    cb(items);
  });
}


export function listenUserReviews(
  userId: string,
  cb: (reviews: Review[]) => void
) {
  const q = query(
    reviewsCollection(),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const items: Review[] = snapshot.docs.map((snap) => {
      const d = snap.data() as DocumentData;
      return {
        id: snap.id,
        kind: d.kind as ReviewKind,
        refId: d.refId as number,
        userId: d.userId as string,
        userName: (d.userName as string) ?? "Usuario anónimo",
        userPhotoUrl:
          (d.userPhotoUrl as string | null | undefined) ?? null,
        rating: d.rating as number,
        body: (d.body as string) ?? "",
        createdAt: d.createdAt?.toDate() ?? new Date(),
      };
    });

    cb(items);
  });
}


export async function setUserReview(
  kind: ReviewKind,
  refId: number,
  params: {
    userId: string;
    userName: string;
    userPhotoUrl?: string | null;
    rating: number;
    body: string;
  }
) {
  const { userId, userName, userPhotoUrl = null, rating, body } = params;
  const id = buildReviewId(kind, refId, userId);
  const ref = doc(reviewsCollection(), id);

  await setDoc(
    ref,
    {
      kind,
      refId,
      userId,
      userName,
      userPhotoUrl,
      rating,
      body,
      createdAt: Timestamp.now(),
    },
    { merge: true }
  );
}
