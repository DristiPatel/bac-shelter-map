import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function updateCatRoom(
  catId: string,
  roomId: string | null
) {
  const ref = doc(db, "cats", catId);

  await updateDoc(ref, {
    roomId,
    updatedAt: new Date(),
  });
}
