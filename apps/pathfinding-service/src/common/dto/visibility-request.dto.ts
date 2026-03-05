import { Coordinates } from '../types/coordinates';

export class VisibilityRequestDto {
  startDate: string;
  endDate: string;
  locationCenter: Coordinates;
  locationRadiusKm: number;
  timeFrameHours: number;
}
