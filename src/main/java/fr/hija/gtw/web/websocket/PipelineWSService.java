package fr.hija.gtw.web.websocket;

import fr.hija.gtw.web.websocket.dto.PipelineMessageDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

import static fr.hija.gtw.config.WebsocketConfiguration.IP_ADDRESS;

@Controller
public class PipelineWSService  {

    private static final Logger log = LoggerFactory.getLogger(PipelineWSService.class);

    private final SimpMessageSendingOperations messagingTemplate;
    public PipelineWSService(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // TODO @SendToUser("/topic/scala-ms-receiver", )
    @MessageMapping("/scala-ms-subscribe")//not used
    @SendTo("/topic/scala-ms-receiver")
    public PipelineMessageDTO sendPplMessageToUser(@Payload PipelineMessageDTO pplDTO, StompHeaderAccessor stompHeaderAccessor, Principal principal) {
        pplDTO.setUserLogin(principal.getName());
        pplDTO.setSessionId(stompHeaderAccessor.getSessionId());
        pplDTO.setIpAddress(stompHeaderAccessor.getSessionAttributes().get(IP_ADDRESS).toString());
        log.info("Sending ppl data to user "+ principal.getName());
        return pplDTO;
    }

    public void sendToUser(String message, String user) {
        log.info("in sendToUser ");
        PipelineMessageDTO pplDTO = new PipelineMessageDTO();
        pplDTO.setBody(message);
        messagingTemplate.convertAndSend("/topic/scala-ms-receiver", pplDTO); //TODO sendToUser
    }

}
