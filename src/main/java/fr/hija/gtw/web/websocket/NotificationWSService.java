package fr.hija.gtw.web.websocket;

import fr.hija.gtw.web.rest.vm.NotificationVM;
import fr.hija.gtw.web.websocket.dto.ActivityDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.Instant;

import static fr.hija.gtw.config.WebsocketConfiguration.IP_ADDRESS;

@Controller
public class NotificationWSService  {

    private static final Logger log = LoggerFactory.getLogger(NotificationWSService.class);

    private final SimpMessageSendingOperations messagingTemplate;

    public NotificationWSService(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void sendNotification(String username, NotificationVM notificationVM) {
        log.info("Sending notification to user "+ username);

        this.sendToUser(username, notificationVM);
    }


    @MessageMapping("/topic/notif")
    public void sendActivity(@Payload NotificationVM notificationVM, StompHeaderAccessor stompHeaderAccessor, Principal principal) {
        notificationVM.setFromUser(principal.getName());
        notificationVM.setTime(Instant.now().toString());
        log.error("------- recieved notification WS, passing to relevant user", notificationVM);
        this.sendToUser(notificationVM.toUser, notificationVM);
    }

    private void sendToUser(String username, NotificationVM notificationVM){
        messagingTemplate.convertAndSendToUser(username,"/topic/notif", notificationVM);
    }
}
