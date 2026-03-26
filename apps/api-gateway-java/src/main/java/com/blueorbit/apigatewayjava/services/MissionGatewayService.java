package com.blueorbit.apigatewayjava.services;

import com.blueorbit.apigatewayjava.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class MissionGatewayService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public Object getAllMissions() {
        Map<String, Object> payload = new HashMap<>();

        Map<String, String> pattern = new HashMap<>();
        pattern.put("cmd", "get_all_missions");

        payload.put("pattern", pattern);
        payload.put("data", new HashMap<>());

        payload.put("id", UUID.randomUUID().toString());

        System.out.println("Sending get_all_missions request to RabbitMQ...");

        return rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.MISSION_QUEUE,
                payload
        );
    }
}
