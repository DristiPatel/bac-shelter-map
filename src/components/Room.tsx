import { useDroppable } from "@dnd-kit/core";
import type { Cat } from "../types/Cat";
import type { Room as RoomType } from "../types/Room";
import { CatIcon } from "./CatIcon";

interface Props {
  room: RoomType;
  cats: Cat[];
}

export function Room({ room, cats }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: room.id });

  return (
    <g transform={`translate(${room.x}, ${room.y})`}>
      {/* Room outline */}
      <rect
        width={room.width}
        height={room.height}
        rx={8}
        ry={8}
        fill={isOver ? "#eef6ff" : "#868282ff"}
        stroke="#666"
        strokeWidth={2}
      />

      {/* Room label */}
      <text
        x={8}
        y={16}
        fontSize={12}
        fill="#333"
        pointerEvents="none"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {room.label}
      </text>

      {/* HTML layout layer */}
      <foreignObject
        x={0}
        y={24}
        width={room.width}
        height={room.height - 24}
      >
        <div
          ref={setNodeRef}
          style={{
            width: "100%",
            height: "100%",
            padding: 2,
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))",
            gridAutoRows: "60px",
            // gap: 4,
            alignContent: "start",
          }}
        >
          {cats.map((cat) => (
            <CatIcon key={cat.id} cat={cat} assigned={true} />
          ))}
        </div>
      </foreignObject>
    </g>
  );
}
