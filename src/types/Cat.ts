export interface Cat {
  id: string;
  name: string;
  sex?: string | null;
  color?: string | null;
  pattern?: string | null;
  intakeDate?: number | null; // Unix timestamp
  photoUrl?: string | null;
  inFoster: boolean;
  roomId?: string | null;
  dividerSide?: "left" | "right" | null;
  status: "in_custody" | "adopted";
}