import { useEffect, useMemo, useState } from "react";
import { collection } from "firebase/firestore";
import { db } from "./firebase";
import { onSnapshot } from "firebase/firestore";
import { CatList } from "./components/CatList";
import type { Cat } from "./types/Cat";
import { Floorplan } from "./components/Floorplan";

function App() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "cats"), (snapshot) => {
      try {
        const data: Cat[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Cat, "id">),
        }));
        setCats(data);
      } catch (err) {
        console.error("Error loading cats:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const { shelterCats, fosterCats } = useMemo(() => {
    return {
      shelterCats: cats.filter((cat) => !cat.inFoster),
      fosterCats: cats.filter((cat) => cat.inFoster),
    };
  }, [cats]);

  if (loading) {
    return <div>Loading cats…</div>;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr max-content",
        height: "100vh",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {/* In-Shelter Cats */}
      <section>
        <h2>🏠 In Shelter</h2>
        <CatList cats={shelterCats} draggable />
      </section>

      <section>
        <h2>Floorplan</h2>
          <Floorplan />
      </section>

      {/* Foster Cats */}
      <section>
        <h2>🏡 In Foster</h2>
        <CatList cats={fosterCats} />
      </section>

    </div>
  );
}

export default App;
