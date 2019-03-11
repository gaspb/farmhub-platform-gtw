package fr.hija.gtw.service;

import fr.hija.gtw.web.rest.vm.Base64VM;
import fr.hija.gtw.web.rest.vm.NotificationVM;
import fr.hija.gtw.web.websocket.NotificationWSService;
import fr.hija.gtw.web.websocket.dto.PipelineMessageDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static fr.hija.gtw.config.WebsocketConfiguration.IP_ADDRESS;


@Controller
public class NotificationService {
    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);



    private final Map<String,List<NotificationVM>> userNotifMap = new HashMap<>();

    private final SimpMessageSendingOperations messagingTemplate;
    private final NotificationWSService notificationWSService;

    public NotificationService(SimpMessageSendingOperations messagingTemplate, NotificationWSService notificationWSService) {
        this.messagingTemplate = messagingTemplate;
        this.notificationWSService = notificationWSService;
        //MOCK HERE
    }


    public List<NotificationVM> getUserNotifications(String userid) {
        log.info("NOTIFSERVICE -retrieve notifications for user "+userid);
        List<NotificationVM> notifications = userNotifMap.get(userid);
        userNotifMap.put(userid,  new ArrayList<>());
        log.info("notif length "+(notifications!=null ? notifications.size() : 0));
        return notifications!=null ? notifications : new ArrayList<>();
    }

    public boolean addUserNotification(String userid, NotificationVM notif) {
        log.info("NOTIFSERVICE -add notification to user "+userid);
        List<NotificationVM> notifications = userNotifMap.get(userid);
        if(notifications==null) {
            notifications = new ArrayList<>();
        }
        notifications.add(notif);
        userNotifMap.put(userid,  notifications);
        log.info("notif length "+notifications.size());
        return true;
    }
    //TODO
    public void callUserToUpdateNotifications(String username) {
        NotificationVM notif = new NotificationVM();
        notif.type="tec";
        notif.name="update_notif";
        this.messagingTemplate.convertAndSendToUser(username, "/queue/update", notif);//stompClient.listen("/user/queue/update")
    }
    public void callUserToUpdateTeams(String username) {
        log.info(">>>> In callUserToUpdateTeams for user "+username);
        NotificationVM notif = new NotificationVM();
        notif.type="tec";
        notif.name="update_team";
        notificationWSService.sendNotification(username, notif);
    }

    public void inviteUserToTeam(String username, String fromUser, String teamId) {
        log.info(">>>> In callUserToUpdateTeams for user "+username);
        NotificationVM notif = new NotificationVM();
        notif.fromUser = fromUser;
        notif.type="both";
        notif.name="invite_team";
        notif.value=teamId;
        notificationWSService.sendNotification(username, notif);
    }
    public void callUserToUpdateProject(String username) {
        NotificationVM notif = new NotificationVM();
        notif.type="tec";
        notif.name="update_project";
        this.messagingTemplate.convertAndSendToUser(username, "/queue/update", notif);//stompClient.listen("/user/queue/update")
    }
}
