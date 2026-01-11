import { useDraggable } from "@dnd-kit/core";
import type { Cat } from "../types/Cat";

interface Props {
    cat: Cat;
}

export function DraggableCat({ cat }: Props) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: cat.id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem",
                cursor: "grab",
            }}
            {...listeners}
            {...attributes}
        >
            <img
                src={cat.photoUrl ?? "/placeholder-cat.png"}
                width={32}
                height={32}
                style={{ borderRadius: "50%" }}
            />
            <span>{cat.name}</span>
        </div>
    );
}
