import { useDraggable } from "@dnd-kit/core";
import type { Cat } from "../types/Cat";

interface Props {
    cat: Cat;
    assigned?: boolean;
}

export function CatIcon({ cat, assigned = false }: Props) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: cat.id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                display: "flex",
                width: assigned ? "max-content" : "auto",
                // Toggle between row (horizontal) and column (vertical)
                flexDirection: assigned ? "column" : "row", 
                alignItems: "center",
                justifyContent: "left",
                gap: assigned ? "0.0rem" : "0.5rem",
                padding: assigned ? "0.0rem" : "0.2rem",
                cursor: "grab",
                // Ensure text centers when stacked vertically
                textAlign: "center", 
            }}
            {...listeners}
            {...attributes}
        >
            <img
                src={cat.photoUrl ?? "/placeholder-cat.png"}
                alt={cat.name}
                width={30}
                height={30}
                style={{
                    borderRadius: "50%",
                    objectFit: "cover",
                }}
            />
            
            <div
                style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontSize: assigned ? "0.55rem" : "1rem", // Optional: smaller text when assigned
                    maxWidth: assigned ? "50px" : "none",    // Keeps the column layout neat
                    color: "#FFF"
                }}
                title={cat.name}
            >
                {cat.name}
            </div>
        </div>
    );
}