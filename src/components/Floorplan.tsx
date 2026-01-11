import type { Room as RoomType} from "../types/Room";
import type { Cat } from "../types/Cat";
import { Room } from "./Room";

interface Props {
  rooms: RoomType[];
  cats: Cat[];
}

export const rooms: RoomType[] = [
    // Room A (Kennels)
    { id: "room-a-k1", label: "Room A Kennel 1", x: 8, y: 248, width: 184, height: 80 },
    { id: "room-a-k2", label: "Room A Kennel 2", x: 8, y: 328, width: 184, height: 80 },
    { id: "room-a-k3", label: "Room A Kennel 3", x: 8, y: 408, width: 184, height: 80 },

    { id: "room-a-k4", label: "Room A Kennel 4", x: 8, y: 0, width: 184, height: 80 },
    { id: "room-a-k5", label: "Room A Kennel 5", x: 8, y: 80, width: 184, height: 80 },
    { id: "room-a-k6", label: "Room A Kennel 6", x: 8, y: 160, width: 184, height: 80 },

    // Room B
    { id: "room-b", label: "Room B", x: 320, y: 248, width: 280, height: 136 },

    //Room C
    { id: "room-c", label: "Room C", x: 608, y: 104, width: 184, height: 280 },

    // Room D
    { id: "room-d", label: "Room D", x: 208, y: 8, width: 272, height: 152 },

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