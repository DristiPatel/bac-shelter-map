import type { Cat } from "../types/Cat";
import { CatIcon } from "./CatIcon";
import { useDroppable } from "@dnd-kit/core";


interface Props {
    cats: Cat[];
    draggable?: boolean;
    title?: string;
    droppableId?: string;

}

export function CatList({ cats, draggable = false, title, droppableId }: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id: droppableId ?? "",
        disabled: !droppableId,
    });
    return (
        <section>
            {title && <h3>{title}</h3>}

            <div
                ref={droppableId ? setNodeRef : undefined}
                style={

                    {
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}><div
                    style={{
                        maxHeight: "80vh",
                        overflowY: "auto",
                        padding: "0.5rem",
                        background: isOver ? "#638fc2ff" : "#3f3b3bff",

                    }}
                >
                    {cats.map((cat) =>
                        draggable ? (
                            <CatIcon key={cat.id} cat={cat} />
                        ) : (
                            <div
                                key={cat.id}
                                style={{
                                    display: "flex",
                                    alignItems: "start",
                                    gap: "0.5rem",
                                    padding: "0.5rem",
                                    opacity: 0.85,
                                }}
                            >
                                <img
                                    src={cat.photoUrl ?? "/placeholder-cat.png"}
                                    width={32}
                                    height={32}
                                    style={{ borderRadius: "50%" }}
                                />
                                <span>{cat.name}</span>
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}
