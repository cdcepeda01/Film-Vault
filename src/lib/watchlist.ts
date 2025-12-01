import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type WatchKind = "movie" | "tv";

export interface WatchlistDoc {
  id: string;          
  userId: string;
  kind: WatchKind;     
  refId: number;       
  createdAt: Date;
}

const watchlistCol = collection(db, "watchlist");


export function listenWatchStatus(
  kind: WatchKind,
  refId: number,
  userId: string,
  cb: (inList: boolean) => void
) {
  const q = query(
    watchlistCol,
    where("userId", "==", userId),
    where("kind", "==", kind),
    where("refId", "==", refId)
  );

  return onSnapshot(q, (snap) => {
    cb(!snap.empty);
  });
}


export async function toggleWatchItem(
  kind: WatchKind,
  refId: number,
  userId: string
): Promise<void> {
  const q = query(
    watchlistCol,
    where("userId", "==", userId),
    where("kind", "==", kind),
    where("refId", "==", refId)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    return;
  }

  await addDoc(watchlistCol, {
    userId,
    kind,
    refId,
    createdAt: serverTimestamp(),
  });
}


export function listenWatchlist(
  userId: string,
  cb: (items: WatchlistDoc[]) => void
) {
  const q = query(
    watchlistCol,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const items: WatchlistDoc[] = snap.docs.map((docSnap) => {
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        userId: data.userId,
        kind: data.kind as WatchKind,
        refId: data.refId,
        createdAt: data.createdAt?.toDate?.() ?? new Date(0),
      };
    });

    cb(items);
  });
}
