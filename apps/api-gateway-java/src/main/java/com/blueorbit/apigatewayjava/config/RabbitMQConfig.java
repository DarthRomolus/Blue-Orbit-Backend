package com.blueorbit.apigatewayjava.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.JacksonJsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String PATHFINDING_QUEUE = "pathfinding_queue";
    public static final String ORBITAL_QUEUE = "orbital_queue"; // התור של Orbital
    @Bean
    public Queue pathfindingQueue() {
        return new Queue(PATHFINDING_QUEUE, false);
    }

    @Bean
    public Queue orbitalQueue() {
        return new Queue(ORBITAL_QUEUE, false);
    }

    @Bean
    public JacksonJsonMessageConverter producerJacksonMessageConverter() {
        return new JacksonJsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(producerJacksonMessageConverter());
        rabbitTemplate.setReplyTimeout(30000);
        return rabbitTemplate;
    }
}