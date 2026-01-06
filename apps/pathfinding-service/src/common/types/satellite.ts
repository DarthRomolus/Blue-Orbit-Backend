export type SatellitePositionGeodetic = {
  longitude: number;
  latitude: number;
  height: number;
};
export type SatelliteData = {
  name: string;
  id: string;
  noradId: string;
  line1: string;
  line2: string;
  updatedAt: Date;
  createdAt: Date;
};
