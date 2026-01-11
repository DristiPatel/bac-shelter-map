import { useDroppable } from "@dnd-kit/core";
import type { Room } from "../types/Room";
import type { Cat } from "../types/Cat";

interface Props {
  rooms: Room[];
  cats: Cat[];
}

export const rooms: Room[] = [
    // Room A (Kennels)
    { id: "room-a-k1", label: "Room A Kennel 1", x: 8, y: 136, width: 184, height: 40 },
    { id: "room-a-k2", label: "Room A Kennel 2", x: 8, y: 176, width: 184, height: 40 },
    { id: "room-a-k3", label: "Room A Kennel 3", x: 8, y: 216, width: 184, height: 40 },

    { id: "room-a-k4", label: "Room A Kennel 4", x: 8, y: 8, width: 184, height: 40 },
    { id: "room-a-k5", label: "Room A Kennel 5", x: 8, y: 48, width: 184, height: 40 },
    { id: "room-a-k6", label: "Room A Kennel 6", x: 8, y: 88, width: 184, height: 40 },

    // Room B
    { id: "room-b", label: "Room B", x: 320, y: 248, width: 280, height: 136 },

    //Room C
    { id: "room-c", label: "Room C", x: 608, y: 104, width: 184, height: 280 },

    // Room D
    { id: "room-d", label: "Room D", x: 208, y: 8, width: 272, height: 152 },

];


export function Floorplan({ rooms, cats }: Props) {
  return (
    <svg
      viewBox="0 0 800 396"
      width="100%"
      height="100%"
    >
      {rooms.map((room) => (
        <RoomDropZone key={room.id} room={room} />
      ))}

      {/* Render cats snapped into rooms */}
      {cats
        .filter((cat) => cat.roomId)
        .map((cat) => {
          const room = rooms.find((r) => r.id === cat.roomId);
          if (!room) return null;

          return (
            <image
              key={cat.id}
              href={cat.photoUrl ?? "/placeholder-cat.png"}
              x={room.x + room.width / 2 - 16}
              y={room.y + room.height / 2 - 16}
              width={32}
              height={32}
              clipPath="circle(16px at 16px 16px)"
            />
          );
        })}
    </svg>
  );
}

function RoomDropZone({ room }: { room: Room }) {
  const { setNodeRef, isOver } = useDroppable({
    id: room.id,
  });

  return (
    <g ref={setNodeRef as any}>
      <rect
        x={room.x}
        y={room.y}
        width={room.width}
        height={room.height}
        rx={8}
        fill={isOver ? "#e6f2ff" : "#fff"}
        stroke="#333"
        strokeWidth={2}
      />
      <text
        x={room.x + 10}
        y={room.y + 10}
        fontFamily="monospace"
        fontWeight={"bold"}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize={10}
        pointerEvents="none"
      >
        {room.label}
      </text>
    </g>
  );
}
