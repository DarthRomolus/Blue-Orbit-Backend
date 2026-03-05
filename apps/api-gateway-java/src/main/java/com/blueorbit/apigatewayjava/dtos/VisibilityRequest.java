package com.blueorbit.apigatewayjava.dtos;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VisibilityRequest {
    private Date startDate;
    private Date endDate;
    private Map<String, Double> locationCenter;
    private double locationRadiusKm;
    private double timeFrameHours;
}
