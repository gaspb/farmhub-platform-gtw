package fr.hija.gtw.web.rest;

import com.codahale.metrics.annotation.Timed;
import fr.hija.gtw.security.oauth2.OAuth2CookieHelper;
import fr.hija.gtw.service.DashboardService;
import fr.hija.gtw.service.NotificationService;
import fr.hija.gtw.web.rest.vm.Base64VM;
import fr.hija.gtw.web.rest.vm.NotificationVM;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing Gateway configuration.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardResource {

    private final Logger log = LoggerFactory.getLogger(DashboardResource.class);

    private final DashboardService dashboardService;
    private final NotificationService notificationService;

    public DashboardResource(DashboardService dashboardService, NotificationService notificationService) {
        this.dashboardService = dashboardService;
        this.notificationService = notificationService;
    }

    private String getUserId(HttpServletRequest request) {

        log.error("Trying to build user id ");
        log.error("Authentification is " + (SecurityContextHolder.getContext().getAuthentication()!=null ? "not " : "" )+ "null");
        if (SecurityContextHolder.getContext().getAuthentication()!=null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            log.error("AUTH Name : "+auth.getName());
         } else {
            log.error("UNAUTH REquest principal : "+ (request.getUserPrincipal()!=null ? request.getUserPrincipal().getName() : "null"));
         }
        String login = SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getName() : OAuth2CookieHelper.getCookie(request, "XSRF-TOKEN").getValue();
        log.error("DSB_GET ID - RETURNING  : "+login);
        return login;
    }

    @RequestMapping(value = "/project", method = RequestMethod.POST, consumes = MediaType
        .APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> saveProject(@RequestBody Base64VM dto) {
        boolean bool = this.dashboardService.saveProjectSession(dto);
        return new ResponseEntity<>(bool, HttpStatus.OK);
    }

    @RequestMapping(value = "/team", method = RequestMethod.POST, consumes = MediaType
        .APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> saveTeam(HttpServletRequest request, @RequestBody Base64VM dto) {
        String userid = this.getUserId(request);
        boolean bool = this.dashboardService.saveTeamSession(userid, dto);
        return new ResponseEntity<>(bool, HttpStatus.OK);
    }

    @RequestMapping(value = "/current", method = RequestMethod.POST, consumes = MediaType
        .APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> saveCurrent(HttpServletRequest request, @RequestBody Base64VM dto) {
        String userid = this.getUserId(request);
        boolean bool = this.dashboardService.saveUseCurrentSession(userid, dto);
        return new ResponseEntity<>(bool, HttpStatus.OK);
    }


    @PostMapping("/project/id")
    @Timed
    public ResponseEntity<Base64VM> getProjectJSON(@RequestBody Map<String, String> params) {
        Base64VM vm = this.dashboardService.getProjectSession(params.get("projectId"));
        return new ResponseEntity<>(vm, HttpStatus.OK);
    }

    @PostMapping("/team/id")
    @Timed
    public ResponseEntity<Base64VM> getTeamJSON(@RequestBody Map<String, String> params) {
        Base64VM vm = this.dashboardService.getTeamSession(params.get("teamId"));
        return new ResponseEntity<>(vm, HttpStatus.OK);
    }

    @GetMapping("/current")
    @Timed
    public ResponseEntity<Base64VM> getCurrentJSON(HttpServletRequest request) {
        String userid = this.getUserId(request);
        Base64VM vm = this.dashboardService.getUserCurrentSession(userid);
        return new ResponseEntity<>(vm, HttpStatus.OK);
    }

    @GetMapping("/teams")
    @Timed
    public ResponseEntity<List<Base64VM>> getTeamsFoUser(HttpServletRequest request) {
        String userid = this.getUserId(request);
        List<Base64VM> vm = this.dashboardService.getUserTeamsSession(userid);
        return new ResponseEntity<>(vm, HttpStatus.OK);
    }

    @RequestMapping(value = "/team/add", method = RequestMethod.POST, consumes = MediaType
        .APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> addTeamToUser(HttpServletRequest request, @RequestBody UserTeamVM userTeam) {
        String fromUser = this.getUserId(request);
       boolean bool = this.dashboardService.addUserTeamsSession(userTeam.userId, userTeam.teamId);
        this.notificationService.inviteUserToTeam(userTeam.userId, fromUser, userTeam.teamId);
        return new ResponseEntity<>(bool, HttpStatus.OK);
    }

    @RequestMapping(value = "/team/remove", method = RequestMethod.POST, consumes = MediaType
        .APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<?> removeTeamFromUser(@RequestBody UserTeamVM userTeam) {
        boolean bool = this.dashboardService.removeUserTeamsSession(userTeam.userId, userTeam.teamId);
        return new ResponseEntity<>(bool, HttpStatus.OK);
    }

    @GetMapping("/notifications")
    @Timed
    public ResponseEntity<List<NotificationVM>> getUserNotifications(HttpServletRequest request) {
        String userId = this.getUserId(request);
        List<NotificationVM> notifs = this.notificationService.getUserNotifications(userId);
        log.info("Retrieved "+notifs.size()+" notifications for user "+userId);
        return new ResponseEntity<>(notifs, HttpStatus.OK);
    }







    //TODO externalize
    private static class UserTeamVM {
        String userId;
        String teamId;

        public UserTeamVM() {
        }

        public UserTeamVM(String userId, String teamId) {
            this.userId = userId;
            this.teamId = teamId;
        }
        public void setUserId(String userId) {
            this.userId = userId;
        }
        public void setTeamId(String teamId) {
            this.teamId = teamId;
        }
    }

}
