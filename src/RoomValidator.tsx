import { writeBatch, doc } from "firebase/firestore";
import type { Cat } from "./types/Cat";
import { db } from "./firebase";

export async function validateRoomAssignments(
  cats: Cat[],
  validRoomIds: Set<string>
) {
  const batch = writeBatch(db);

  cats.forEach(cat => {
    if (cat.roomId && !validRoomIds.has(cat.roomId)) {
      batch.update(doc(db, "cats", cat.id), {
        roomId: null,
      });
    }
  });

  await batch.commit();
}
