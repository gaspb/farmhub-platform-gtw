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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Controller
public class PlaygroundService {
    private static final Logger log = LoggerFactory.getLogger(PlaygroundService.class);
    private final String PG_USER_CACHE_NAME = "user_playground_session";
    private final CacheManager cacheManager;
    //temp
    private final String PG_GLOBAL_OP_JSON_CACHE_NAME = "operations_json_playground_session";
    private final String PG_GLOBAL_OP_DESC_CACHE_NAME = "operations_desc_playground_session";
    private final String PG_GLOBAL_TEMPLATE_CACHE_NAME = "templates_playground_session";
    private final String PG_GLOBAL_PUBLIC_API_CACHE = "public_api_playground_session";

    private final SwaggerParser parser;

    /**
     * TODO : -perform requests to microservice holding db through kafka ? or do it through kafka from front (less safe)
     */
    public PlaygroundService( ) {
        MutableConfiguration config = new MutableConfiguration<>();
        CachingProvider cachingProvider = Caching.getCachingProvider();
        this.cacheManager = cachingProvider.getCacheManager();
       Cache userCache =  cacheManager.createCache(PG_USER_CACHE_NAME, config);
        Cache opJsonCache = cacheManager.createCache(PG_GLOBAL_OP_JSON_CACHE_NAME, config);

        Cache opDescCache = cacheManager.createCache(PG_GLOBAL_OP_DESC_CACHE_NAME, config);
        opJsonCache.put(0, new HashSet<PlaygroundOperationDescVM>());
        Cache templateCache = cacheManager.createCache(PG_GLOBAL_TEMPLATE_CACHE_NAME, config);
        Cache publicApiCache = cacheManager.createCache(PG_GLOBAL_PUBLIC_API_CACHE, config);
        publicApiCache.put(0, new HashSet<PublicApiVM>());
        log.info("Created HazelCast cache for Playground user session");

        parser =  new SwaggerParser();
        //MOCK HERE
    }


    public PlaygroundHTMLVM getPGSession(String userid) {
        Cache<String, PlaygroundHTMLVM> cache = this.cacheManager.getCache(PG_USER_CACHE_NAME);
        PlaygroundHTMLVM vm = cache.get(userid);
        log.info("PGSERVICE - getPGSession - retrieved " + ( (vm==null || vm.getHtmlTemplate()==null) ? "0" : "1") +" cached session");
        return vm;
    }

    public boolean savePgSession(String userid, PlaygroundHTMLVM vm) {
        Cache<String, PlaygroundHTMLVM> cache = this.cacheManager.getCache(PG_USER_CACHE_NAME);
        cache.put(userid, vm);
        log.info("PGSERVICE - savePgSession - saved session for user "+userid);
        return true;
    }

    public boolean saveOperation(String operationName, PlaygroundOperationDTO dto) {
        //save both json and desc, return updated descs
        Cache<String, PlaygroundJSONOperationVM> cache = this.cacheManager.getCache(PG_GLOBAL_OP_JSON_CACHE_NAME);
        cache.put(operationName,dto.getJson());
        Cache<Integer, Set<PlaygroundOperationDescVM>> cache2 = this.cacheManager.getCache(PG_GLOBAL_OP_DESC_CACHE_NAME);
        Set<PlaygroundOperationDescVM> s = cache2.get(0);
        if (s==null) {
            s = new HashSet<>();
        }
        s.add(dto.getDesc());
        cache2.put(0,s);
        log.info("PGSERVICE - saveOperation - added operation "+operationName+" to both caches : desc= "+dto.getDesc().getOperationName() + " - size="+s.size()+" cach: "+cache2.get(0).size());
        return true;
    }

    public boolean savePublicApi(PublicApiVM vm) {
        Cache<Integer, Set<PublicApiVM>> cache = this.cacheManager.getCache(PG_GLOBAL_PUBLIC_API_CACHE);
        Set<PublicApiVM> s = cache.get(0);
        if (s==null) {
            s = new HashSet<>();
        }
        s.add(vm);
        cache.put(0,s);
        log.info("PGSERVICE - Saved Public APi "+vm.getName());
        return true;
    }
    public Set<PublicApiVM> getPublicApiList() {
        Cache<Integer, Set<PublicApiVM>> cache = this.cacheManager.getCache(PG_GLOBAL_PUBLIC_API_CACHE);
        Set<PublicApiVM> s = cache.get(0);
        if (s==null) {
            s = new HashSet<>();
        }
        log.info("PGSERVICE - Get Public Api List - retrieved "+s.size()+" elements");
        return s;
    }



    public PlaygroundJSONOperationVM getOperationJSON(String operationName) {
        Cache<String, PlaygroundJSONOperationVM> cache = this.cacheManager.getCache(PG_GLOBAL_OP_JSON_CACHE_NAME);
        PlaygroundJSONOperationVM vm = cache.get(operationName);

        log.info("PGSERVICE - getOperationJSON - retrieved op "+operationName+" : "+(vm!=null));
        return vm;
    }
    public Set<PlaygroundOperationDescVM> getOperationList() {
        Cache<Integer, Set<PlaygroundOperationDescVM>> cache = this.cacheManager.getCache(PG_GLOBAL_OP_DESC_CACHE_NAME);
        Set<PlaygroundOperationDescVM> vm = cache.get(0);
        if (vm==null) {
            vm = new HashSet<>();
        }
        log.info("PGSERVICE - getOperationList - retrieved "+vm.size()+" operations");
        return vm;
    }

    public List<Swagger> getRegisteredMsList(List<Route> routes, DiscoveryClient discoveryClient) {


        List<Swagger> apis = new ArrayList<>();
        try {
            Swagger api = getApiDocs("http://127.0.0.1:8080/v2/api-docs");
            apis.add(api);
        } catch(Exception e) {
            log.error("FAILED TO GET SWAGGER API FROM GTW : exception : "+e+"  --   "+e.getMessage());
        }

        routes.forEach(route-> {
            try {
                Swagger api = getApiDocs(discoveryClient.getInstances(route.getLocation()).get(0).getUri() + "/v2/api-docs");
                apis.add(api);
            } catch(Exception e) {
                log.error("FAILED TO GET SWAGGER API FOR URL : "+discoveryClient.getInstances(route.getLocation()).get(0).getUri() +route.getFullPath().replace("**", "v2/api-docs")+" : exception : "+e+"  --   "+e.getMessage());
            }
        });
        return apis;
    }


    private Swagger getApiDocs(String urlStr) throws Exception {
        URL url = new URL(urlStr);
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");

            BufferedReader in = new BufferedReader(
                new InputStreamReader(con.getInputStream()));
            String output;
            StringBuffer response = new StringBuffer();

            while ((output = in.readLine()) != null) {
                response.append(output);
            }
            in.close();

            Swagger api = parser.parse(response.toString());
            log.info("Retrieved swagger for endpoint : "+api.getHost());

            return api;



    }

}
