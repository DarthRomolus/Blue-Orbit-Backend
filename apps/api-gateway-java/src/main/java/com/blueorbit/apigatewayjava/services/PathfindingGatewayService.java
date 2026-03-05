package com.blueorbit.apigatewayjava.services;

import com.blueorbit.apigatewayjava.config.RabbitMQConfig;
import com.blueorbit.apigatewayjava.dtos.VisibilityRequest;
import com.blueorbit.apigatewayjava.dtos.PathfindingRequest;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID; // <--- אל תשכח את ה-import הזה

@Service
public class PathfindingGatewayService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public Object calculateCoverage(VisibilityRequest request) {
        Map<String, Object> payload = new HashMap<>();

        Map<String, String> pattern = new HashMap<>();
        pattern.put("cmd", "calculate_coverage");

        payload.put("pattern", pattern);
        payload.put("data", request);

        // התיקון: הוספת מזהה ייחודי כדי ש-NestJS יבין שזה RPC וישלח תשובה
        payload.put("id", UUID.randomUUID().toString());

        System.out.println("Sending visibility request to RabbitMQ...");

        return rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.PATHFINDING_QUEUE,
                payload
        );
    }
    public Object calculatePath(PathfindingRequest request) {
        Map<String, Object> payload = new HashMap<>();

        Map<String, String> pattern = new HashMap<>();
        pattern.put("cmd", "calculate_path");

        payload.put("pattern", pattern);
        payload.put("data", request);

        // התיקון: הוספת מזהה ייחודי כדי ש-NestJS יבין שזה RPC וישלח תשובה
        payload.put("id", UUID.randomUUID().toString());

        System.out.println("Sending Pathfinding request to RabbitMQ...");

        return rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.PATHFINDING_QUEUE,
                payload
        );
    }
}