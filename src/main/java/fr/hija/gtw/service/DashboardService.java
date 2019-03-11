package fr.hija.gtw.service;

import fr.hija.gtw.web.rest.vm.*;
import io.swagger.models.Swagger;
import io.swagger.parser.SwaggerParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.netflix.zuul.filters.Route;
import org.springframework.stereotype.Controller;

import javax.cache.Cache;
import javax.cache.CacheManager;
import javax.cache.Caching;
import javax.cache.configuration.MutableConfiguration;
import javax.cache.spi.CachingProvider;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;


@Controller
public class DashboardService {
    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);



    private final Map<String,String> userCurrentMap = new HashMap<>();
    private final Map<String,String> projectMap = new HashMap<>();
    private final Map<String,String> teamMap = new HashMap<>();
    private final Map<String,Set<String>> userTeamsMap = new HashMap<>();


    public DashboardService( ) {

        log.info("Created HazelCast cache for DashboardService user session");

        //MOCK HERE
    }

    public List<Base64VM> getUserTeamsSession(String userid) {
        Set<String> teamList = userTeamsMap.get(userid);
        if(teamList==null) {
            teamList = new HashSet<>();
        }
        List<Base64VM> list = new ArrayList<>();
        for (String team : teamList) {
            list.add(this.getTeamSession(team));
        }
        log.info("DSBSERVICE - getUserTeamsSession - retrieved list name of length "+teamList.size()+" and list of elements of length "+list.size());
        return list;
    }
    public boolean addUserTeamsSession(String userid, String teamId) {
        Set<String> teamList = userTeamsMap.get(userid);
        if(teamList==null) {
            teamList = new HashSet<>();
        }
        teamList.add(teamId);
        userTeamsMap.put(userid, teamList);
        log.info("DSBSERVICE - addUserTeamsSession - added team "+teamId+" to user "+userid+" team map");
        return true;
    }
    public boolean removeUserTeamsSession(String userid, String teamId) {
        Set<String> teamList = userTeamsMap.get(userid);

        boolean b = teamList==null || teamList.remove(teamId);
        userTeamsMap.put(userid, teamList);
        log.info("DSBSERVICE - addUserTeamsSession - removed team "+teamId+" from user "+userid+" team map - "+b);
        return true;
    }
    public Base64VM getUserCurrentSession(String userid) {
        Base64VM vm = new Base64VM(userid, userCurrentMap.get(userid));
        log.info("DSBSERVICE - getUserSession - retrieved " + ( (vm==null || vm.getBase64()==null) ? "0" : "1") +" of "+userCurrentMap.size()+" cached session by userId -{}-", userid);
        return vm;
    }
    public Base64VM getProjectSession(String projectid) {
        Base64VM vm = new Base64VM(projectid, projectMap.get(projectid));
        log.info("DSBSERVICE - getProjectSession - retrieved " + ( (vm==null || vm.getBase64()==null) ? "0" : "1") +" of "+projectMap.size()+" cached session by projectId -{}-", projectid);
        return vm;
    }
    public Base64VM getTeamSession(String teamid) {
        Base64VM vm = new Base64VM(teamid, teamMap.get(teamid));
        log.info("DSBSERVICE - getTeamSession - retrieved " + ( (vm==null || vm.getBase64()==null) ? "0" : "1") +" of "+teamMap.size()+" cached session by teamId -{}-", teamid);
        return vm;
    }

    public boolean saveUseCurrentSession(String userid, Base64VM vm) {
        userCurrentMap.put(userid, vm.getBase64());
        log.info("DSBSERVICE - saveUseCurrentSession - saved session for user "+userid+" with value"+vm.getBase64());
        return true;
    }
    public boolean saveProjectSession(Base64VM vm) {
        projectMap.put(vm.getId(), vm.getBase64());
        log.info("DSBSERVICE - saveProjectSession - saved session for project "+vm.getId());
        return true;
    }
    public boolean saveTeamSession(String userId, Base64VM vm) {
        teamMap.put(vm.getId(), vm.getBase64());
        log.info("DSBSERVICE - saveTeamSession - saved session for team "+vm.getId());
        this.addUserTeamsSession(userId, vm.getId());
        return true;
    }

}
