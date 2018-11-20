package fr.hija.gtw.web.kafka;

import org.springframework.cloud.stream.annotation.Input;
import org.springframework.messaging.SubscribableChannel;

public interface ConsumerChannel {

    String SCALA_CHANNEL = "scalaSubscribableChannel";
    String DEFAULT_CHANNEL = "defaultSubscribableChannel";

    @Input(value=SCALA_CHANNEL)
    SubscribableChannel scalaSubscribableChannel();

    @Input(value=DEFAULT_CHANNEL)
    SubscribableChannel defaultSubscribableChannel();
}
