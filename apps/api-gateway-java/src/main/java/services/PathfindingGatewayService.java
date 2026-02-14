package services;

import config.RabbitMQConfig;
import dtos.VisibilityRequest;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class PathfindingGatewayService {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public Object calculateCoverage(VisibilityRequest request) {
        // בונים את המעטפה ש-NestJS מצפה לקבל
        Map<String, Object> payload = new HashMap<>();

        // הפקודה (Command) שהגדרת ב-NestJS
        Map<String, String> pattern = new HashMap<>();
        pattern.put("cmd", "calculate_coverage");

        payload.put("pattern", pattern);
        payload.put("data", request);

        System.out.println("Sending visibility request to RabbitMQ...");

        // שליחה, פתיחת תור זמני לתשובה, והמתנה
        return rabbitTemplate.convertSendAndReceive(
                RabbitMQConfig.PATHFINDING_QUEUE,
                payload
        );
    }
}
