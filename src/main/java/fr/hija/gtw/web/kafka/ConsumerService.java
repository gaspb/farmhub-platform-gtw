package fr.hija.gtw.web.kafka;

import fr.hija.gtw.web.websocket.PipelineWSService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.stream.annotation.StreamListener;
import org.springframework.stereotype.Service;


@Service
public class ConsumerService {

    private PipelineWSService pplWsService;
    public ConsumerService(PipelineWSService pplWsService) {
        this.pplWsService = pplWsService;
    }


    private final Logger log = LoggerFactory.getLogger(ConsumerService.class);


    @StreamListener(ConsumerChannel.SCALA_CHANNEL)
    public void consumeScala(MessageModel message) {
        log.info("Received message from scala-ms:  {} ", message.getMessage()); //TODO pass user with msg
        log.info("Sending to user via websocket");
        pplWsService.sendToUser(message.getMessage(), "admin"); //TODO
    }

    @StreamListener(ConsumerChannel.DEFAULT_CHANNEL)
    public void consumeDefault(MessageModel message) {
        log.info("Received message on default:  {} ", message.getMessage());
    }
}
