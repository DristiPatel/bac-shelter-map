import { useEffect, useMemo, useState } from "react";
import { collection, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { onSnapshot } from "firebase/firestore";
import type { Cat } from "./types/Cat";
import { FloorPlan } from "./components/Floorplan";
import { DndContext, DragOverlay, type DragEndEvent, type DragStartEvent, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { CatList } from "./components/CatList";
import { CatDragPreview } from "./components/CatDragPreview";
import { updateCatRoom } from "./RoomUpdater";
import { validateRoomAssignments } from "./RoomValidator";
import type { Room } from "./types/Room";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import Tooltip from "@mui/material/Tooltip";

function App() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [activeCat, setActiveCat] = useState<Cat | null>(null);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [editMode, setEditMode] = useState(false);

  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

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

    // Check maxCats limit
    if (newRoomId) {
      const targetRoom = rooms.find((r) => r.id === newRoomId);
      if (targetRoom && targetRoom.maxCats) {
        if (targetRoom.divided) {
          // Validation for divided rooms (per-side capacity)
          const limit = targetRoom.maxCats;

          const currentCatsInSide = cats.filter(
            (c) =>
              c.roomId === newRoomId &&
              c.dividerSide === newDividerSide &&
              c.id !== active.id
          );

          if (currentCatsInSide.length >= limit) {
            setActiveCat(null);
            return; // Cancel drop
          }
        } else {
          // Validation for standard rooms
          const currentCatsInRoom = cats.filter(
            (c) => c.roomId === newRoomId && c.id !== active.id
          );
          if (currentCatsInRoom.length >= targetRoom.maxCats) {
            setActiveCat(null);
            return; // Cancel drop
          }
        }
      }
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
      sensors={sensors}
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
          title={`In Shelter (${unassignedShelterCats.length}🐱)`}
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
            <h3 style={{ margin: 0 }}>{`Floorplan (${inCustodyCats.filter(c => c.roomId).length}🐱)`}</h3>
            <Tooltip title={editMode ? "Exit Edit Mode" : "Edit Floorplan"}>
              <IconButton
                onClick={() => setEditMode((v) => !v)}
                sx={{
                  color: "#FFF",
                  backgroundColor: editMode ? "#420b0b" : "#0b315c",
                  "&:hover": {
                    backgroundColor: editMode ? "#5e1010" : "#10427a",
                  },
                  "&:focus": { outline: "none" },
                  width: 26,
                  height: 26,
                }}
                size="small"
              >
                {editMode ? <CheckIcon sx={{ fontSize: 18 }} /> : <EditIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
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
          title={`In Foster (${unassignedFosterCats.length}🐱)`}
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
