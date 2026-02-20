package com.blueorbit.apigatewayjava.controllers;

import com.blueorbit.apigatewayjava.services.OrbitalGatewayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orbital")
public class OrbitalController {

    @Autowired
    private OrbitalGatewayService orbitalService;

    // הפרונטאנד עכשיו יפנה אל: GET http://localhost:8080/api/orbital/satellites
    @GetMapping("/satellites")
    public Object getAllSatellitesData() {
        return orbitalService.getAllSatellites();
    }
    @GetMapping("/path/{noradID}")
    public Object getSatellitePath(@PathVariable String noradID) {
        return orbitalService.getSatellitePath(noradID);
    }
}