import { useEffect, useMemo, useState } from "react";
import { collection } from "firebase/firestore";
import { db } from "./firebase";
import { onSnapshot } from "firebase/firestore";
import type { Cat } from "./types/Cat";
import { Floorplan } from "./components/Floorplan";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { rooms } from "./components/Floorplan";
import { CatList } from "./components/CatList";
import { CatDragPreview } from "./components/CatDragPreview";



function App() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [activeCat, setActiveCat] = useState<Cat | null>(null);

  const [loading, setLoading] = useState(true);

  /**
   * Load cats from Firestore (realtime)
   */
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "cats"),
      (snapshot) => {
        const data: Cat[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Cat, "id">),
        }));

        setCats(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  /**
   * Split cats into shelter vs foster
   */
  const { shelterCats, fosterCats } = useMemo(() => {
    return {
      shelterCats: cats.filter((c) => !c.inFoster),
      fosterCats: cats.filter((c) => c.inFoster),
    };
  }, [cats]);


  function handleDragStart(event: DragStartEvent) {
    const cat = cats.find((c) => c.id === event.active.id);
    if (cat) setActiveCat(cat);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over?.id && active.id !== over.id) {
      const roomId = over.id as string;

      setCats((prev) =>
        prev.map((cat) =>
          cat.id === active.id
            ? { ...cat, roomId }
            : cat
        )
      );
    }

    setActiveCat(null);
  }


  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading cats…</div>;
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "200px minmax(1000px, 1fr) 200px",
          height: "100vh",
          gap: "1rem",
          padding: "1rem",
          overflow: "hidden"
        }}
      >
        {/* 🐈 In-Shelter (Draggable) */}
        <CatList
          title="🏠 In Shelter"
          cats={shelterCats}
          draggable
        />

        {/* 🗺️ Floorplan */}
        <section>
          <h3>Floorplan</h3>
          <Floorplan rooms={rooms} cats={shelterCats} />
        </section>

        {/* 🏡 Foster (Read-only) */}
        <CatList
          title="🏡 In Foster"
          cats={fosterCats}
        />
      </div>

      <DragOverlay>
        {activeCat ? <CatDragPreview cat={activeCat} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;