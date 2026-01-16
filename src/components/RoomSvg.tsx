import { useDroppable } from "@dnd-kit/core";
import type { Cat } from "../types/Cat";
import type { Room } from "../types/Room";
import { CatIcon } from "./CatIcon";
import { useRef, useState } from "react";

interface RoomProps {
  room: Room;
  editMode: boolean;
  cats: Cat[];
  onUpdate: (room: Room) => void;
  onCommit: (room: Room) => void;
}

export function RoomSvg({ room, editMode, cats, onUpdate, onCommit }: RoomProps) {
  const { setNodeRef, isOver } = useDroppable({ id: room.id });

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);

  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const startRoom = useRef<Room | null>(null);

  function onMouseDownMove(e: React.MouseEvent<SVGGElement>) {
    if (!editMode) return;

    e.stopPropagation();
    setDragging(true);
    startPoint.current = { x: e.clientX, y: e.clientY };
    startRoom.current = room;
  }

  function onMouseDownResize(e: React.MouseEvent<SVGRectElement>) {
    if (!editMode) return;

    e.stopPropagation();
    setResizing(true);
    startPoint.current = { x: e.clientX, y: e.clientY };
    startRoom.current = room;
  }

  function onMouseMove(e: React.MouseEvent<SVGGElement>) {
    if (!startPoint.current || !startRoom.current) return;

    const dx = e.clientX - startPoint.current.x;
    const dy = e.clientY - startPoint.current.y;

    if (dragging) {
      onUpdate({
        ...startRoom.current,
        x: startRoom.current.x + dx,
        y: startRoom.current.y + dy,
      });
    }

    if (resizing) {
      onUpdate({
        ...startRoom.current,
        width: Math.max(80, startRoom.current.width + dx),
        height: Math.max(80, startRoom.current.height + dy),
      });
    }
  }

  function onMouseUp() {
    console.log("Mouse up");
    if (startRoom.current && (dragging || resizing)) {
      console.log("Committing room", startRoom.current, "to", room);
      onCommit(room);
    }

    setDragging(false);
    setResizing(false);
    startPoint.current = null;
    startRoom.current = null;
  }


  return (
    <g transform={`translate(${room.x}, ${room.y})`}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      >

      {/* Room outline */}
      <rect
        width={room.width}
        height={room.height}
        rx={8}
        ry={8}
        fill={isOver ? "#eef6ff" : "#868282ff"}
        stroke="#666"
        strokeWidth={2}
        cursor={editMode ? "move" : "default"}
        onMouseDown={onMouseDownMove}
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

      {/* Resize handle */}
      {editMode && (
      <rect
        x={room.width - 10}
        y={room.height - 10}
        width={10}
        height={10}
        fill="#ccc"
        stroke="#999"
        strokeWidth={1}
        rx={2}
        ry={2}
        cursor={editMode ? "nwse-resize" : "default"}
        onMouseDown={onMouseDownResize}
      />)}
    </g>
  );
}


