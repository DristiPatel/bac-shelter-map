import type { Room } from "../types/Room";
import type { Cat } from "../types/Cat";
import { RoomSvg } from "./RoomSvg";

interface Props {
  rooms: Room[];
  cats: Cat[];
  editMode: boolean;
  onRoomUpdate: (room: Room) => void;
  onRoomCommit: (room: Room) => void;
}

// export const rooms: Room[] = [
//   // Room 1 (Kennels)
//   { id: "room-1-k1", label: "Room 1 Kennel 1", x: 16, y: 4, width: 184, height: 90 },
//   { id: "room-1-k2", label: "Room 1 Kennel 2", x: 16, y: 94, width: 184, height: 90 },
//   { id: "room-1-k3", label: "Room 1 Kennel 3", x: 16, y: 184, width: 184, height: 90 },

//   { id: "room-1-k4", label: "Room 1 Kennel 4", x: 208, y: 4, width: 184, height: 90 },
//   { id: "room-1-k5", label: "Room 1 Kennel 5", x: 208, y: 94, width: 184, height: 90 },
//   { id: "room-1-k6", label: "Room 1 Kennel 6", x: 208, y: 184, width: 184, height: 90 },

//   // Room 2
//   { id: "room-2", label: "Room 2", x: 40, y: 336, width: 280, height: 184 },

//   //Room 3
//   { id: "room-3", label: "Room 3", x: 364, y: 336, width: 280, height: 184 },

//   // Room 4
//   { id: "room-4", label: "Room 4", x: 440, y: 4, width: 200, height: 272 },
// ];

export function FloorPlan({ cats, rooms, editMode, onRoomUpdate, onRoomCommit }: Props) {
  return (
    <svg
      viewBox="0 0 1000 600"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{
        borderRadius: 8,
      }}
    >
      {rooms.map((room) => (
        <RoomSvg
          key={room.id}
          room={room}
          cats={cats.filter((c) => c.roomId === room.id)}
          editMode={editMode}
          onUpdate={onRoomUpdate}
          onCommit={onRoomCommit}
        />
      ))}
    </svg>
  );
}
