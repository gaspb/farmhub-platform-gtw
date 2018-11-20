package fr.hija.gtw.web.kafka;

import org.springframework.cloud.stream.annotation.Output;
import org.springframework.messaging.MessageChannel;

public interface ProducerChannel {

    String SCALA_CHANNEL = "scalaMessageChannel";
    String DEFAULT_CHANNEL = "defaultMessageChannel";

    @Output(value=SCALA_CHANNEL)
    MessageChannel scalaMessageChannel();

    @Output(value=DEFAULT_CHANNEL)
    MessageChannel defaultMessageChannel();
}
