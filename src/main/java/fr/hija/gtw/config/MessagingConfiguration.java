package fr.hija.gtw.config;

import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.messaging.Source;

/**
 * Configures Spring Cloud Stream support.
 *
 * This works out-of-the-box if you use the Docker Compose configuration at "src/main/docker/kafka.yml".
 *
 * See http://docs.spring.io/spring-cloud-stream/docs/current/reference/htmlsingle/
 * for the official Spring Cloud Stream documentation.
 */
@EnableBinding(value = { Source.class })
public class MessagingConfiguration {

    /**
     * This sends a test message at regular intervals.
     *
     * In order to see the test messages, you can use the Kafka command-line client:
     * "./kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic topic-jhipster --from-beginning".
     */
 /*   @Bean
    @InboundChannelAdapter(value = Source.OUTPUT)
    public MessageSource<String> timerMessageSource() {
        return () -> new GenericMessage<>("Test message from JHipster sent at " +
            new SimpleDateFormat().format(new Date()));
    }*/
}
