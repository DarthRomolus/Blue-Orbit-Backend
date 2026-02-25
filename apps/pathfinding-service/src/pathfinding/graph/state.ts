export type State = {
  latitude: number;
  longitude: number;
  altitude: number;
  time: Date;
  bearingDegrees: number;
  costToPoint: number;
  parentNode: State | null;
};
export type ChildrenGroup = {
  left: State;
  straight: State;
  right: State;
};
export type ScoredState = {
  state: State;
  fCost: number;
};
