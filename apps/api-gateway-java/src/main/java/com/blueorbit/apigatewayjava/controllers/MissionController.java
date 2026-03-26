package com.blueorbit.apigatewayjava.controllers;

import com.blueorbit.apigatewayjava.services.MissionGatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mission")
public class MissionController {

    @Autowired
    private MissionGatewayService gatewayService;

    @GetMapping("/all")
    public Object getAllMissions() {
        return gatewayService.getAllMissions();
    }
}
