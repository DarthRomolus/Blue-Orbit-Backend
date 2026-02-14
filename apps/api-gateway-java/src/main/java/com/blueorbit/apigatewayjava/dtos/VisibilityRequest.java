package com.blueorbit.apigatewayjava.dtos;


import lombok.Data;
import java.util.Date;
import java.util.Map;

@Data
public class VisibilityRequest {
    private Date startDate;
    private Date endDate;
    private Map<String, Double> locationCenter;
    private double locationRadiusKm;
    private double timeFrameHours;
}
