package fr.hija.gtw.config;

import fr.hija.gtw.security.AuthoritiesConstants;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

@Configuration
public class WebsocketSecurityConfiguration extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            .nullDestMatcher().permitAll()
            .simpDestMatchers("/topic/tracker").hasAuthority(AuthoritiesConstants.ADMIN)
            .simpDestMatchers("/topic/message").permitAll()
            .simpDestMatchers("/topic/message/**").permitAll()
            .simpDestMatchers("/ws1reciever").permitAll()
            .simpDestMatchers("/ws1").permitAll()
            .simpDestMatchers("/topic/scala-ms-receiver").permitAll()
            .simpDestMatchers("/topic/scala-ms-receiver/**").permitAll()
            .simpDestMatchers("/scala-ms-subscribe").permitAll() //TODO
            .simpDestMatchers("/scalams").permitAll() //TODO

            // matches any destination that starts with /topic/
            // (i.e. cannot send messages directly to /topic/)
            // (i.e. cannot subscribe to /topic/messages/* to get messages sent to
            // /topic/messages-user<id>)
            .simpDestMatchers("/topic/**").authenticated()
            // message types other than MESSAGE and SUBSCRIBE
        .simpTypeMatchers(SimpMessageType.MESSAGE, SimpMessageType.SUBSCRIBE).denyAll()
            // catch all
        .anyMessage().denyAll();
    }

    /**
     * Disables CSRF for Websockets.
     */
    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }
}
