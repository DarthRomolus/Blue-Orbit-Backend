package com.blueorbit.apigatewayjava.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // מחיל את החוקים על כל ה-Endpoints ב-Gateway
                        .allowedOriginPatterns("*") // מאפשר גישה מכל דומיין/פורט (מעולה לשלב הפיתוח)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // מאפשר את כל סוגי הבקשות
                        .allowedHeaders("*") // מאפשר את כל ההדרים (Headers)
                        .allowCredentials(true); // מאפשר שליחת Cookies או Tokens (חשוב אם יהיה לך Auth בהמשך)
            }
        };
    }
}