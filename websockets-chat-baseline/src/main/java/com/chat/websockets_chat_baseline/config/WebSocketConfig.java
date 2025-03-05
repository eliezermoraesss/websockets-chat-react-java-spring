package com.chat.websockets_chat_baseline.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Ativa um broker simples para enviar mensagens para clientes inscritos
        config.enableSimpleBroker("/topic");
        // Prefixo para mensagens enviadas do cliente para o back-end
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Define o endpoint para conexão WebSocket (com fallback para SockJS)
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
