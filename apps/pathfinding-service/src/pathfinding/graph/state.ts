export type State = {
  latitude: number;
  longitude: number;
  altitude: number;
  time: Date;
  bearingDegrees: number;
  costToPoint: number;
  parentNode: State | null;
};
export type ChildrenStates = {
  left: State;
  straight: State;
  right: State;
};
export type StatesList = {
  state: State;
  Fcost: number;
};
