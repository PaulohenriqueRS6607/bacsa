package com.example.livros.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permite requisições de qualquer origem (isso pode ser ajustado para domínios específicos em produção)
        config.addAllowedOrigin("*");
        // Permite todos os métodos HTTP (GET, POST, PUT, DELETE, etc)
        config.addAllowedMethod("*");
        // Permite todos os headers
        config.addAllowedHeader("*");
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
