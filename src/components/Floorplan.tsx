import type { Room as RoomType} from "../types/Room";
import type { Cat } from "../types/Cat";
import { Room } from "./Room";

interface Props {
  rooms: RoomType[];
  cats: Cat[];
}

export const rooms: RoomType[] = [
    // Room 1 (Kennels)
    { id: "room-1-k1", label: "R1 Kennel 1", x: 8, y: 200, width: 90, height: 184 },
    { id: "room-1-k2", label: "R1 Kennel 2", x: 98, y: 200, width: 90, height: 184 },
    { id: "room-1-k3", label: "R1 Kennel 3", x: 188, y: 200, width: 90, height: 184 },

    { id: "room-1-k4", label: "R1 Kennel 4", x: 8, y: 8, width: 90, height: 184 },
    { id: "room-1-k5", label: "R1 Kennel 5", x: 98, y: 8, width: 90, height: 184 },
    { id: "room-1-k6", label: "R1 Kennel 6", x: 188, y: 8, width: 90, height: 184 },

    // Room 2
    { id: "room-2", label: "Room 2", x: 370, y: 248, width: 280, height: 136 },

    //Room 3
    { id: "room-3", label: "Room 3", x: 658, y: 104, width: 184, height: 280 },

    // Room 4
    { id: "room-4", label: "Room 4", x: 300, y: 8, width: 272, height: 152 },

];



export function FloorPlan({ cats, rooms }: Props) {
  return (
    <svg
      viewBox="0 0 850 400"
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