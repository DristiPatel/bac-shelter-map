interface ShelterluvCat {
  ID: string;
  Name: string;
  Sex?: string;
  Color?: string;
  Pattern?: string;
  CoverPhoto?: string;
  LastIntakeUnixTime?: number;
  InFoster: boolean;
}

export { ShelterluvCat };