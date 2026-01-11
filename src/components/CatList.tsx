import type { Cat } from "../types/Cat";
import { DraggableCat } from "./DraggableCat";

interface Props {
    cats: Cat[];
    draggable?: boolean;
    title?: string;
}

export function CatList({ cats, draggable = false, title }: Props) {
    return (
        <section>
            {title && <h3>{title}</h3>}

            <div style={
                {
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}>
                <div
                    style={{
                        maxHeight: "80vh",
                        overflowY: "auto",
                        padding: "0.5rem",
                    }}
                >
                    {cats.map((cat) =>
                        draggable ? (
                            <DraggableCat key={cat.id} cat={cat} />
                        ) : (
                            <div
                                key={cat.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
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
