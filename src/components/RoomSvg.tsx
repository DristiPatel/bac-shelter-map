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
  /* ---------------- DROPPABLES ---------------- */

  const wholeDrop = useDroppable({
    id: room.id,
    disabled: room.divided || editMode,
  });

  const leftDrop = useDroppable({
    id: `${room.id}-left`,
    disabled: !room.divided || editMode,
  });

  const rightDrop = useDroppable({
    id: `${room.id}-right`,
    disabled: !room.divided || editMode,
  });

  /* ---------------- DRAG / RESIZE STATE ---------------- */

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

  /* ---------------- CAT GROUPING ---------------- */

  const leftCats = cats.filter(
    (c) => !room.divided || c.dividerSide !== "right"
  );

  const rightCats = cats.filter(
    (c) => room.divided && c.dividerSide === "right"
  );

  /* ---------------- RENDER ---------------- */

  return (
    <g transform={`translate(${room.x}, ${room.y})`}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >

      {/* Room outline */}
      <rect
        width={room.width}
        height={room.height}
        rx={8}
        ry={8}
        fill={
          wholeDrop.isOver || leftDrop.isOver || rightDrop.isOver
            ? "#eef6ff"
            : "#868282ff"
        }
        stroke="#666"
        strokeWidth={2}
        cursor={editMode ? "move" : "default"}
        onMouseDown={onMouseDownMove}
      />

      {/* Divider */}
      {room.divided && (
        <line
          x1={room.width / 2}
          y1={0}
          x2={room.width / 2}
          y2={room.height}
          stroke="#444"
          strokeDasharray="4 3"
          strokeWidth={1}
          pointerEvents="none"
        />
      )}

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

      {/* Divider toggle */}
      {editMode && (
        <foreignObject
          x={room.width - 90}
          y={4}
          width={85}
          height={24}
        >
          <button
            style={{ fontSize: 8 }}
            onClick={(e) => {
              e.stopPropagation();
              onCommit({
                ...room,
                divided: !room.divided,
              });
            }}
          >
            {room.divided ? "Remove Divider" : "Add Divider"}
          </button>
        </foreignObject>
      )}

      {/* Cat Droppable Area */}
      <foreignObject
        x={0}
        y={24}
        width={room.width}
        height={room.height - 24}
      >
        <div
          ref={
            room.divided
              ? undefined
              : wholeDrop.setNodeRef
          }
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: room.divided ? "1fr 1fr" : "1fr",
            gridAutoRows: "60px",
            columnGap: room.divided ? "6px" : "0px",
            padding: 2,
            boxSizing: "border-box",
            alignContent: "start",
          }}
        >
          {/* LEFT */}
          <div ref={room.divided ? leftDrop.setNodeRef : undefined}>
            {leftCats.map((cat) => (
              <CatIcon key={cat.id} cat={cat} />
            ))}
          </div>
          
          {/* RIGHT */}
          {room.divided && (
            <div ref={rightDrop.setNodeRef}>
              {rightCats.map((cat) => (
                <CatIcon key={cat.id} cat={cat} />
              ))}
            </div>
          )}
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


