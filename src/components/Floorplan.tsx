import { useEffect, useRef, useState } from "react";
import type { Room } from "../types/Room";
import type { Cat } from "../types/Cat";
import { RoomSvg } from "./RoomSvg";
import Button from "@mui/material/Button";
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
        backgroundColor: "#1e293b",
        borderRadius: 8,
        overflow: "hidden", 
        boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
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
            <circle cx="2" cy="2" r="1" fill="#334155" />
            <circle cx="22" cy="2" r="1" fill="#334155" />
            <circle cx="42" cy="2" r="1" fill="#334155" />
            <circle cx="62" cy="2" r="1" fill="#334155" />
            <circle cx="82" cy="2" r="1" fill="#334155" />
            {/* Row 2 */}
            <circle cx="2" cy="22" r="1" fill="#334155" />
            <circle cx="22" cy="22" r="1" fill="#334155" />
            <circle cx="42" cy="22" r="1" fill="#334155" />
            <circle cx="62" cy="22" r="1" fill="#334155" />
            <circle cx="82" cy="22" r="1" fill="#334155" />
            {/* Row 3 */}
            <circle cx="2" cy="42" r="1" fill="#334155" />
            <circle cx="22" cy="42" r="1" fill="#334155" />
            <circle cx="42" cy="42" r="1" fill="#334155" />
            <circle cx="62" cy="42" r="1" fill="#334155" />
            <circle cx="82" cy="42" r="1" fill="#334155" />
            {/* Row 4 */}
            <circle cx="2" cy="62" r="1" fill="#334155" />
            <circle cx="22" cy="62" r="1" fill="#334155" />
            <circle cx="42" cy="62" r="1" fill="#334155" />
            <circle cx="62" cy="62" r="1" fill="#334155" />
            <circle cx="82" cy="62" r="1" fill="#334155" />
            {/* Row 5 */}
            <circle cx="2" cy="82" r="1" fill="#334155" />
            <circle cx="22" cy="82" r="1" fill="#334155" />
            <circle cx="42" cy="82" r="1" fill="#334155" />
            <circle cx="62" cy="82" r="1" fill="#334155" />
            <circle cx="82" cy="82" r="1" fill="#334155" />
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
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      onRoomCommit({
                        ...room,
                        divided: !room.divided,
                      });
                    }}
                    sx={{
                      fontSize: "1em",
                      padding: "6px 14px",
                      minWidth: "auto",
                      lineHeight: 1.1,
                      backgroundColor: room.divided ? "rgba(46, 125, 50, 0.85)" : "rgba(33, 33, 33, 0.75)",
                      backdropFilter: "blur(4px)",
                      color: "#fff",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "6px",
                      boxShadow: room.divided 
                        ? "0 4px 12px rgba(46, 125, 50, 0.3)" 
                        : "0 4px 12px rgba(0, 0, 0, 0.2)",
                      "&:hover": {
                        backgroundColor: room.divided ? "rgba(46, 125, 50, 1)" : "rgba(33, 33, 33, 0.9)",
                        boxShadow: room.divided 
                          ? "0 6px 16px rgba(46, 125, 50, 0.4)" 
                          : "0 6px 16px rgba(0, 0, 0, 0.3)",
                        borderColor: "rgba(255, 255, 255, 0.4)",
                      },
                      "&:focus": { outline: "none" },
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 600,
                      fontFamily: "inherit",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    {room.divided ? "Divider ON" : "Divider OFF"}
                  </Button>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
