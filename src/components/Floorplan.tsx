import { useEffect, useRef, useState } from "react";
import type { Room } from "../types/Room";
import type { Cat } from "../types/Cat";
import { RoomSvg } from "./RoomSvg";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Tooltip from "@mui/material/Tooltip";

interface Props {
  rooms: Room[];
  cats: Cat[];
  editMode: boolean;
  onRoomUpdate: (room: Room) => void;
  onRoomCommit: (room: Room) => void;
}

export function FloorPlan({ cats, rooms, editMode, onRoomUpdate, onRoomCommit }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewRect, setViewRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    const update = () => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const containerRatio = rect.width / rect.height;
      const svgRatio = 1000 / 600;

      let w, h, x, y;
      if (containerRatio > svgRatio) {
        h = rect.height;
        w = h * svgRatio;
        x = (rect.width - w) / 2;
        y = 0;
      } else {
        w = rect.width;
        h = w / svgRatio;
        x = 0;
        y = (rect.height - h) / 2;
      }
      setViewRect({ x, y, width: w, height: h });
    };

    const observer = new ResizeObserver(update);
    if (svgRef.current) observer.observe(svgRef.current);
    update();

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#fcfcfc",
        borderRadius: 8,
        overflow: "hidden", 
      }}
    >
      <svg
        ref={svgRef}
        className="floorplan-svg"
        viewBox="0 0 1000 600"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: "block",
          overflow: "visible",
          outline: "none",
        }}
      >
        <defs>
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

      {/* HTML Overlay strictly aligned to the SVG's meet-viewport */}
      {editMode && (
        <div
          style={{
            position: "absolute",
            left: viewRect.x,
            top: viewRect.y,
            width: viewRect.width,
            height: viewRect.height,
            pointerEvents: "none",
          }}
        >
          {rooms.map((room) => (
            <div
              key={room.id}
              style={{
                position: "absolute",
                left: `${(room.x / 1000) * 100}%`,
                top: `${(room.y / 600) * 100}%`,
                width: `${(room.width / 1000) * 100}%`,
                height: `${(room.height / 600) * 100}%`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  pointerEvents: "auto",
                }}
              >
                <Tooltip title={room.divided ? "Remove Divider" : "Add Divider"}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      onRoomCommit({
                        ...room,
                        divided: !room.divided,
                      });
                    }}
                    sx={{
                      width: 26,
                      height: 26,
                      padding: 0,
                      backgroundColor: "#fff",
                      border: "1px solid #999",
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                      "&:focus": { outline: "none" },
                    }}
                  >
                    {room.divided ? <RemoveIcon sx={{ fontSize: 16 }} /> : <AddIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
