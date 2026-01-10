import type { Cat } from "../types/Cat";

interface Props {
  cats: Cat[];
  draggable?: boolean;
}

export function CatList({ cats, draggable = false }: Props) {
  return (
    <div
      style={{
        maxHeight: "80vh",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      {cats.map((cat) => (
        <div
          key={cat.id}
          draggable={draggable}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.5rem",
            gap: "0.75rem",
            borderBottom: "1px solid #eee",
            cursor: draggable ? "grab" : "default",
            opacity: draggable ? 1 : 0.85,
          }}
        >
          <img
            src={cat.photoUrl ?? "/placeholder-cat.png"}
            alt={cat.name}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <span>{cat.name}</span>
        </div>
      ))}
    </div>
  );
}
