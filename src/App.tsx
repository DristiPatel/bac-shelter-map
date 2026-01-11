import { useEffect, useMemo, useState } from "react";
import { collection } from "firebase/firestore";
import { db } from "./firebase";
import { onSnapshot } from "firebase/firestore";
import type { Cat } from "./types/Cat";
import { FloorPlan } from "./components/Floorplan";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { rooms } from "./components/Floorplan";
import { CatList } from "./components/CatList";
import { CatDragPreview } from "./components/CatDragPreview";
import { updateCatRoom } from "./RoomUpdater";

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

  // Get in custody cats (not adopted yet)
  const inCustodyCats = cats.filter(
    (c) => c.status === "in_custody"
  );

  // Split cats into shelter vs foster
  const { shelterCats, fosterCats } = useMemo(() => {
    return {
      shelterCats: inCustodyCats.filter((c) => !c.inFoster),
      fosterCats: inCustodyCats.filter((c) => c.inFoster),
    };
  }, [cats]);

  // Additionally, get unassigned shelter cats for the list
  const unassignedShelterCats = useMemo(() => {
    return shelterCats.filter((cat) => !cat.roomId);
  }, [shelterCats]);


  function handleDragStart(event: DragStartEvent) {
    const cat = cats.find((c) => c.id === event.active.id);
    if (cat) setActiveCat(cat);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveCat(null);
    if (!over) {
      return;
    }

    const newRoomId =
      over.id === "shelter-list"
        ? null
        : (over.id as string);

    // Optimistic UI update
    setCats((prev) =>
      prev.map((cat) =>
        cat.id === active.id
          ? { ...cat, roomId: newRoomId }
          : cat
      )
    );

    try {
      await updateCatRoom(active.id as string, newRoomId);
    } catch (error) {
      console.error("Failed to update cat room", error);

      // Rollback on failure
      setCats((prev) =>
        prev.map((cat) =>
          cat.id === active.id
            ? { ...cat, roomId: null }
            : cat
        )
      );
    }

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
          cats={unassignedShelterCats}
          draggable
          droppableId="shelter-list"

        />

        {/* 🗺️ Floorplan */}
        <section>
          <h3>Floorplan</h3>
          <FloorPlan rooms={rooms} cats={shelterCats} />
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