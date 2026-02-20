package com.blueorbit.apigatewayjava.services;

import com.blueorbit.apigatewayjava.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class OrbitalGatewayService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public Object getAllSatellites() {
        Map<String, Object> payload = new HashMap<>();

        // קוראים לפקודה המלאה שיצרנו ב-NestJS
        Map<String, String> pattern = new HashMap<>();
        pattern.put("cmd", "get_full_satellites");

        payload.put("pattern", pattern);
        payload.put("data", new HashMap<>()); // אין צורך לשלוח נתונים בבקשה הזו
        payload.put("id", UUID.randomUUID().toString());

        return rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.ORBITAL_QUEUE,
                payload
        );
    }
    public Object getSatellitePath(String noradID) {
        Map<String, Object> payload = new HashMap<>();

        // קוראים לפקודה המלאה שיצרנו ב-NestJS
        Map<String, String> pattern = new HashMap<>();
        pattern.put("cmd", "get_satellite_path");
        payload.put("pattern", pattern);
        payload.put("data", noradID); // אין צורך לשלוח נתונים בבקשה הזו
        payload.put("id", UUID.randomUUID().toString());

        return rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.ORBITAL_QUEUE,
                payload
        );
    }
}