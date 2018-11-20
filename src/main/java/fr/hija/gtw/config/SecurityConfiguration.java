package fr.hija.gtw.config;

import fr.hija.gtw.config.oauth2.OAuth2JwtAccessTokenConverter;
import fr.hija.gtw.config.oauth2.OAuth2Properties;
import fr.hija.gtw.security.AuthoritiesConstants;
import fr.hija.gtw.security.oauth2.OAuth2SignatureVerifierClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.client.loadbalancer.RestTemplateCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.config.annotation.web.configuration.EnableResourceServer;
import org.springframework.security.oauth2.config.annotation.web.configuration.ResourceServerConfigurerAdapter;
import org.springframework.security.oauth2.provider.token.TokenStore;
import org.springframework.security.oauth2.provider.token.store.JwtAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.store.JwtTokenStore;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableResourceServer
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfiguration extends ResourceServerConfigurerAdapter {
    private final OAuth2Properties oAuth2Properties;

    private final CorsFilter corsFilter;

    public SecurityConfiguration(OAuth2Properties oAuth2Properties, CorsFilter corsFilter) {
        this.oAuth2Properties = oAuth2Properties;
        this.corsFilter = corsFilter;
    }

    @Override
    public void configure(HttpSecurity http) throws Exception {
        http
            .csrf()
            .disable()
            .headers()
            .frameOptions()
            .disable()
        .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
            .authorizeRequests()
			.antMatchers("/scalapipeline").permitAll()
			.antMatchers("/scalapipeline/api/**").permitAll()
			.antMatchers("/scalapipeline/**").permitAll()
            .antMatchers("/api/**").authenticated()
            .antMatchers("/api/profile-info").permitAll()
            .antMatchers("/uaa/api/profile-info").permitAll()

            .antMatchers("/**/info").permitAll()//TODO
            .antMatchers("/websocket/ws1/info").permitAll()//TODO
            .antMatchers("/ws1reciever").permitAll()
            .antMatchers("/ws1").permitAll()
            .antMatchers("/ws1/cache").permitAll()
            .antMatchers("/websocket/ws1").permitAll()
            .antMatchers("/websocket/scalams").permitAll()
            .antMatchers("/scala-ms-subscribe").permitAll()
            .antMatchers("/scalams").permitAll()
            .antMatchers("/api/playground/**").permitAll()


            .antMatchers("/management/health").permitAll()
            .antMatchers("/management/info").permitAll()
            .antMatchers("/management/**").hasAuthority(AuthoritiesConstants.ADMIN);
    }

    @Bean
    public TokenStore tokenStore(JwtAccessTokenConverter jwtAccessTokenConverter) {
        return new JwtTokenStore(jwtAccessTokenConverter);
    }

    @Bean
    public JwtAccessTokenConverter jwtAccessTokenConverter(OAuth2SignatureVerifierClient signatureVerifierClient) {
        return new OAuth2JwtAccessTokenConverter(oAuth2Properties, signatureVerifierClient);
    }

    @Bean
	@Qualifier("loadBalancedRestTemplate")
    public RestTemplate loadBalancedRestTemplate(RestTemplateCustomizer customizer) {
        RestTemplate restTemplate = new RestTemplate();
        customizer.customize(restTemplate);
        return restTemplate;
    }

    @Bean
    @Qualifier("vanillaRestTemplate")
    public RestTemplate vanillaRestTemplate() {
        return new RestTemplate();
    }
}
