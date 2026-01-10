interface Room {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

const rooms: Room[] = [
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

export function Floorplan() {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 392"
        //   style={{ border: "1px solid #ccc", background: "#fafafa" }}
        >
            {rooms.map((room) => (
                <g key={room.id}>
                    {/* Room box */}
                    <rect
                        x={room.x}
                        y={room.y}
                        width={room.width}
                        height={room.height}
                        rx={8}
                        fill="#fff"
                        stroke="#333"
                        strokeWidth={2}
                    />

                    {/* Room label */}
                    <text
                        x={room.x + 10}
                        y={room.y + 10}
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="start"
                        dominantBaseline="middle"
                        fontSize={10}
                        fill="#333"
                        pointerEvents="none"
                    >
                        {room.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}
