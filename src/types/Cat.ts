export interface Cat {
  id: string;
  name: string;
  photoUrl?: string | null;
  inFoster: boolean;
  roomId?: string | null;
}