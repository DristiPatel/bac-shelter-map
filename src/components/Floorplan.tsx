import type { Room as RoomType} from "../types/Room";
import type { Cat } from "../types/Cat";
import { Room } from "./Room";

interface Props {
  rooms: RoomType[];
  cats: Cat[];
}

export const rooms: RoomType[] = [
    // Room 1 (Kennels)
    { id: "room-1-k1", label: "Room 1 Kennel 1", x: 8, y: 248, width: 184, height: 80 },
    { id: "room-1-k2", label: "Room 1 Kennel 2", x: 8, y: 328, width: 184, height: 80 },
    { id: "room-1-k3", label: "Room 1 Kennel 3", x: 8, y: 408, width: 184, height: 80 },

    { id: "room-1-k4", label: "Room 1 Kennel 4", x: 8, y: 0, width: 184, height: 80 },
    { id: "room-1-k5", label: "Room 1 Kennel 5", x: 8, y: 80, width: 184, height: 80 },
    { id: "room-1-k6", label: "Room 1 Kennel 6", x: 8, y: 160, width: 184, height: 80 },

    // Room 2
    { id: "room-2", label: "Room 2", x: 320, y: 248, width: 280, height: 136 },

    //Room 3
    { id: "room-3", label: "Room 3", x: 608, y: 104, width: 184, height: 280 },

    // Room 4
    { id: "room-4", label: "Room 4", x: 208, y: 8, width: 272, height: 152 },

];



export function FloorPlan({ cats, rooms }: Props) {
  return (
    <svg
      viewBox="0 0 800 400"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{
        borderRadius: 8,
      }}
    >
      {rooms.map((room) => (
        <Room
          key={room.id}
          room={room}
          cats={cats.filter((c) => c.roomId === room.id)}
        />
      ))}
    </svg>
  );
}