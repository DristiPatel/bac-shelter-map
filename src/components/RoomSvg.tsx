import { useDroppable } from "@dnd-kit/core";
import type { Cat } from "../types/Cat";
import type { Room } from "../types/Room";
import { CatIcon } from "./CatIcon";
import { useRef } from "react";

interface RoomProps {
  room: Room;
  editMode: boolean;
  cats: Cat[];
  onUpdate: (room: Room) => void;
  onCommit: (room: Room) => void;
}

export function RoomSvg({ room, editMode, cats, onUpdate, onCommit }: RoomProps) {
  /* ---------------- DROPPABLES ---------------- */

  const { isOver: isWholeOver, setNodeRef: setWholeRef } = useDroppable({
    id: room.id,
    disabled: room.divided || editMode,
  });

  const { isOver: isLeftOver, setNodeRef: setLeftRef } = useDroppable({
    id: `${room.id}-left`,
    disabled: !room.divided || editMode,
  });

  const { isOver: isRightOver, setNodeRef: setRightRef } = useDroppable({
    id: `${room.id}-right`,
    disabled: !room.divided || editMode,
  });

  /* ---------------- DRAG / RESIZE STATE ---------------- */

  const activeOperation = useRef<"drag" | "resize" | null>(null);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const startRoom = useRef<Room | null>(null);

  // Refs to access latest values inside window event listeners
  const latestRoomRef = useRef(room);
  latestRoomRef.current = room;

  const propsRef = useRef({ onUpdate, onCommit });
  propsRef.current = { onUpdate, onCommit };

  const GRID_SIZE = 20;
  const snap = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

  function onWindowMouseMove(e: MouseEvent) {
    if (!startPoint.current || !startRoom.current || !activeOperation.current) return;

    // Use the SVG's screen CTM to convert mouse delta (pixels) to SVG units.
    const svg = document.querySelector(".floorplan-svg") as SVGSVGElement | null;
    if (!svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const svgDx = (e.clientX - startPoint.current.x) / ctm.a;
    const svgDy = (e.clientY - startPoint.current.y) / ctm.d;

    if (activeOperation.current === "drag") {
      const nextX = snap(startRoom.current.x + svgDx);
      const nextY = snap(startRoom.current.y + svgDy);

      propsRef.current.onUpdate({
        ...startRoom.current,
        // Clamp to viewBox 0 0 1000 600
        x: Math.max(0, Math.min(1000 - startRoom.current.width, nextX)),
        y: Math.max(0, Math.min(600 - startRoom.current.height, nextY)),
      });
    } else if (activeOperation.current === "resize") {
      const nextW = snap(startRoom.current.width + svgDx);
      const nextH = snap(startRoom.current.height + svgDy);

      propsRef.current.onUpdate({
        ...startRoom.current,
        // Clamp dimensions based on position
        width: Math.max(80, Math.min(1000 - startRoom.current.x, nextW)),
        height: Math.max(80, Math.min(600 - startRoom.current.y, nextH)),
      });
    }
  }

  function onWindowMouseUp() {
    if (activeOperation.current && startRoom.current) {
      console.log("Committing room", latestRoomRef.current);
      propsRef.current.onCommit(latestRoomRef.current);
    }

    activeOperation.current = null;
    startPoint.current = null;
    startRoom.current = null;

    window.removeEventListener("mousemove", onWindowMouseMove);
    window.removeEventListener("mouseup", onWindowMouseUp);
  }

  function onMouseDownMove(e: React.MouseEvent<SVGGElement>) {
    if (!editMode) return;

    e.preventDefault();
    e.stopPropagation();
    
    activeOperation.current = "drag";
    startPoint.current = { x: e.clientX, y: e.clientY };
    startRoom.current = room;

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
  }

  function onMouseDownResize(e: React.MouseEvent<SVGRectElement>) {
    if (!editMode) return;

    e.preventDefault();
    e.stopPropagation();

    activeOperation.current = "resize";
    startPoint.current = { x: e.clientX, y: e.clientY };
    startRoom.current = room;

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
  }

  /* ---------------- CAT GROUPING ---------------- */

  const leftCats = cats.filter(
    (c) => !room.divided || c.dividerSide !== "right"
  );

  const rightCats = cats.filter(
    (c) => room.divided && c.dividerSide === "right"
  );

  /* ---------------- RENDER ---------------- */

  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "grid",
    gridTemplateColumns: room.divided ? "minmax(0, 1fr) minmax(0, 1fr)" : "1fr",
    columnGap: room.divided ? "32px" : "0px",
    gridAutoRows: "60px",
    padding: "8px",
    boxSizing: "border-box",
    alignContent: "start",
  };

  const sideStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap", 
    gap: "10px",    
    justifyContent: "flex-start", 
    alignContent: "flex-start",
  };

  return (
    <g transform={`translate(${Math.max(0, room.x)}, ${Math.max(0, room.y)})`}
    >

      {/* Room outline */}
      <rect
        width={room.width}
        height={room.height}
        rx={12}
        ry={12}
        fill={
          isWholeOver || isLeftOver || isRightOver
            ? "rgba(79, 70, 229, 0.4)" // Indigo 600, 40%
            : "#334155" // Slate 700
        }
        stroke="#64748b" // Slate 500
        strokeWidth={1}
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
          stroke="#94a3b8"
          strokeDasharray="2 2"
          strokeWidth={0.5}
          pointerEvents="none"
        />
      )}

      {/* Room label */}
      <text
        x={8}
        y={16}
        fontSize={12}
        fill="#e2e8f0" // Slate 200
        pointerEvents="none"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {room.label}
      </text>

      {/* Cat Droppable Area */}
      <foreignObject
        x={0}
        y={16}
        width={room.width}
        height={room.height - 16}
      >
        <div
          ref={
            room.divided
              ? undefined
              : setWholeRef
          }
          style={containerStyle}
        >
          {/* LEFT */}
          <div ref={room.divided ? setLeftRef : undefined}
            style={sideStyle}>
            {leftCats.map((cat) => (
              <CatIcon key={cat.id} cat={cat} assigned={true} />
            ))}
          </div>

          {/* RIGHT */}
          {room.divided && (
            <div ref={setRightRef}
              style={sideStyle}>
              {rightCats.map((cat) => (
                <CatIcon key={cat.id} cat={cat} assigned={true} />
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




