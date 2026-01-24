import { useEffect, useMemo, useState } from "react";
import { collection, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { onSnapshot } from "firebase/firestore";
import type { Cat } from "./types/Cat";
import { FloorPlan } from "./components/Floorplan";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { CatList } from "./components/CatList";
import { CatDragPreview } from "./components/CatDragPreview";
import { updateCatRoom } from "./RoomUpdater";
import { validateRoomAssignments } from "./RoomValidator";
import type { Room } from "./types/Room";

function App() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [activeCat, setActiveCat] = useState<Cat | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [editMode, setEditMode] = useState(false);

  const [loading, setLoading] = useState(true);

  // Load cats and rooms from Firestore (realtime)
  useEffect(() => {
    const unsubRooms = onSnapshot(
      collection(db, "rooms"),
      (snapshot) => {
        const roomsData: Room[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Room, "id">),
        }));
        setRooms(roomsData);
      },
      (error) => {
        console.error("Firestore error:", error);
      }
    );

    const unsubCats = onSnapshot(
      collection(db, "cats"),
      (snapshot) => {
        const catData: Cat[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Cat, "id">),
        }));

        setCats(catData);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubRooms();
      unsubCats();
    };
  }, []);

  // Heal invalid room assignments
  useEffect(() => {
    if (!rooms.length || !cats.length) return;

    validateRoomAssignments(cats, new Set(rooms.map(r => r.id)));
  }, [rooms, cats]);

  function handleRoomUpdate(updated: Room) {
    setRooms((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  }

  async function handleRoomCommit(room: Room) {
    const ref = doc(db, "rooms", room.id);

    await updateDoc(ref, {
      ...room,
      updatedAt: new Date(),
    });
  }


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
  }, [inCustodyCats]);

  // Get unassigned shelter cats for the list
  const unassignedShelterCats = useMemo(() => {
    return shelterCats.filter((cat) => !cat.roomId);
  }, [shelterCats]);

  // Get unassigned foster cats for the list
  const unassignedFosterCats = useMemo(() => {
    return fosterCats.filter((cat) => !cat.roomId);
  }, [fosterCats]);


  function handleDragStart(event: DragStartEvent) {
    const cat = cats.find((c) => c.id === event.active.id);
    if (cat) setActiveCat(cat);
  }

 async function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;

  setActiveCat(null);
  if (!over) return;

  let newRoomId: string | null = null;
  let newDividerSide: "left" | "right" | undefined = undefined;

  const overId = over.id as string;

  // Dropped back into lists
  if (overId === "shelter-list" || overId === "foster-list") {
    newRoomId = null;
    newDividerSide = undefined;
  }

  // Dropped into divided room side
  else if (overId.endsWith("-left")) {
    newRoomId = overId.replace("-left", "");
    newDividerSide = "left";
  } else if (overId.endsWith("-right")) {
    newRoomId = overId.replace("-right", "");
    newDividerSide = "right";
  }

  // Dropped into undivided room
  else {
    newRoomId = overId;
    newDividerSide = undefined;
  }

  // Optimistic UI update
  setCats((prev) =>
    prev.map((cat) =>
      cat.id === active.id
        ? {
            ...cat,
            roomId: newRoomId,
            dividerSide: newDividerSide,
          }
        : cat
    )
  );

  try {
    await updateCatRoom(
      active.id as string,
      newRoomId,
      newDividerSide,
    );
  } catch (error) {
    console.error("Failed to update cat room", error);

    // Rollback on failure
    setCats((prev) =>
      prev.map((cat) =>
        cat.id === active.id
          ? {
              ...cat,
              roomId: null,
              roomSide: undefined,
            }
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
      onDragStart={editMode ? undefined : handleDragStart}
      onDragEnd={editMode ? undefined : handleDragEnd}
    >
      <div
        className="main-layout-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 200px) 1fr minmax(180px, 200px)",
          width: "100vw",
          height: "100vh",
          gap: "1rem",
          padding: "1rem",
          boxSizing: "border-box",
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
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minWidth: 0,
            overflow: "hidden", // Prevent section from expanding past grid row
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <h3 style={{ margin: 0 }}>Floorplan</h3>
            <button
              onClick={() => setEditMode((v) => !v)}
              title={editMode ? "Exit Edit Mode" : "Edit Floorplan"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                padding: 0,
                borderRadius: "50%",
                border: "1px solid #343333",
                color: "#FFF",
                background: editMode ? "#420b0b" : "#0b315c",
                cursor: "pointer",
              }}
            >
              {editMode ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              )}
            </button>
          </div>

          {/* SVG container */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              borderRadius: 8,
              padding: "0.5rem",
              overflow: "hidden", // Ensure container strictly clips content and respects flex size
              position: "relative",
            }}
          >
            <FloorPlan
              rooms={rooms}
              cats={inCustodyCats}
              editMode={editMode}
              onRoomUpdate={handleRoomUpdate}
              onRoomCommit={handleRoomCommit}
            />
          </div>
        </section>


        {/* 🏡 Foster (Read-only) */}
        <CatList
          title="🏡 In Foster"
          cats={unassignedFosterCats}
          draggable
          droppableId="foster-list"
        />
      </div>

      <DragOverlay>
        {activeCat ? <CatDragPreview cat={activeCat} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
