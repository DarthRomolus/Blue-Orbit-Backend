/** DTO for the pathfinding response sent back to the API Gateway */
export class PathfindingResponseDto {
  success: boolean;
  nodesExplored: number;
  totalCost: number;
  pathLength: number;
}
