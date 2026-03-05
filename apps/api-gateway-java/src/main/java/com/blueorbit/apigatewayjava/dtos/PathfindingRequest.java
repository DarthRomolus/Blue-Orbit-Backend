package com.blueorbit.apigatewayjava.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PathfindingRequest {

    private StateDTO startState;
    private GoalDTO goal;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StateDTO {
        private double latitude;
        private double longitude;
        private double altitude;
        private double bearingDegrees;


        private Instant time;

        private double costToPoint;

        private StateDTO parentNode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalDTO {
        private double latitude;
        private double longitude;
    }
}
