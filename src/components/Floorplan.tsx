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

export function FloorPlan({ cats, rooms, editMode, onRoomUpdate, onRoomCommit }: Props) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex", // Flex container
        flexDirection: "column",
        backgroundColor: "#fcfcfc",
        borderRadius: 8,
        overflow: "hidden", 
      }}
    >
      <svg
        className="floorplan-svg"
        viewBox="0 0 1000 600"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: "block",
          flex: 1,      // Fill flex container
          minHeight: 0, // Allow shrinking
          maxHeight: "100%", // Clamp to container height
          overflow: "visible",
          outline: "none",
        }}
      >
        <defs>
          {/* 
            Using a larger pattern tile (100x100) with multiple dots 
            can reduce rendering artifacts (seams) in some browsers.
          */}
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            {/* Row 1 */}
            <circle cx="2" cy="2" r="1" fill="#ccc" />
            <circle cx="22" cy="2" r="1" fill="#ccc" />
            <circle cx="42" cy="2" r="1" fill="#ccc" />
            <circle cx="62" cy="2" r="1" fill="#ccc" />
            <circle cx="82" cy="2" r="1" fill="#ccc" />

            {/* Row 2 */}
            <circle cx="2" cy="22" r="1" fill="#ccc" />
            <circle cx="22" cy="22" r="1" fill="#ccc" />
            <circle cx="42" cy="22" r="1" fill="#ccc" />
            <circle cx="62" cy="22" r="1" fill="#ccc" />
            <circle cx="82" cy="22" r="1" fill="#ccc" />

            {/* Row 3 */}
            <circle cx="2" cy="42" r="1" fill="#ccc" />
            <circle cx="22" cy="42" r="1" fill="#ccc" />
            <circle cx="42" cy="42" r="1" fill="#ccc" />
            <circle cx="62" cy="42" r="1" fill="#ccc" />
            <circle cx="82" cy="42" r="1" fill="#ccc" />

            {/* Row 4 */}
            <circle cx="2" cy="62" r="1" fill="#ccc" />
            <circle cx="22" cy="62" r="1" fill="#ccc" />
            <circle cx="42" cy="62" r="1" fill="#ccc" />
            <circle cx="62" cy="62" r="1" fill="#ccc" />
            <circle cx="82" cy="62" r="1" fill="#ccc" />

            {/* Row 5 */}
            <circle cx="2" cy="82" r="1" fill="#ccc" />
            <circle cx="22" cy="82" r="1" fill="#ccc" />
            <circle cx="42" cy="82" r="1" fill="#ccc" />
            <circle cx="62" cy="82" r="1" fill="#ccc" />
            <circle cx="82" cy="82" r="1" fill="#ccc" />
          </pattern>
        </defs>

        <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#grid)" />

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
    </div>
  );
}