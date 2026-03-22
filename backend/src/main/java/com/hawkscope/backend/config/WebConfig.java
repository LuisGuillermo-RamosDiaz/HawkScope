package com.hawkscope.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private ApiKeyInterceptor apiKeyInterceptor;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // El interceptor X-API-KEY SOLO protege el endpoint del agente
        // Las rutas de auth y dashboard usan JWT, NO X-API-KEY
        registry.addInterceptor(apiKeyInterceptor)
                .addPathPatterns("/api/v1/agent/**")
                .excludePathPatterns(
                    "/api/v1/auth/**",
                    "/api/v1/dashboard/**",
                    "/api/v1/metrics/**",
                    "/health"
                );
    }
}
