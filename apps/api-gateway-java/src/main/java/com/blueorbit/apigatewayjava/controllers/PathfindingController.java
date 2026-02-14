package com.blueorbit.apigatewayjava.controllers;


import com.blueorbit.apigatewayjava.dtos.VisibilityRequest;
import com.blueorbit.apigatewayjava.services.PathfindingGatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pathfinding")
public class PathfindingController {

    @Autowired
    private PathfindingGatewayService gatewayService;

    @PostMapping("/visibility")
    public Object checkVisibility(@RequestBody VisibilityRequest request) {
        return gatewayService.calculateCoverage(request);
    }
}
