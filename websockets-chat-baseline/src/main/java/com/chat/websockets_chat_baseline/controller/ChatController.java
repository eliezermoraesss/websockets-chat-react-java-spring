package com.chat.websockets_chat_baseline.controller;

import com.chat.websockets_chat_baseline.model.ChatMessage;
import com.chat.websockets_chat_baseline.repository.ChatMessageRepository;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;

    public ChatController(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    // Mapeia mensagens enviadas para /app/chat
    @MessageMapping("/chat")
    // Envia para os inscritos no destino /topic/messages
    @SendTo("/topic/messages")
    public ChatMessage send(ChatMessage message) throws Exception {
        chatMessageRepository.save(message);
        Thread.sleep(80);
        return message;
    }
}
