package com.library.controller;

import com.library.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    // POST /api/chatbot
    // Body: { "message": "what is the borrow limit?", "userId": 1 }
    @PostMapping
    public Map<String, String> chat(@RequestBody Map<String, Object> body) {
        String message = (String) body.getOrDefault("message", "");
        Long userId = body.get("userId") != null
                ? Long.valueOf(body.get("userId").toString()) : 0L;
        String reply = chatbotService.respond(message, userId);
        return Map.of("reply", reply);
    }
}
