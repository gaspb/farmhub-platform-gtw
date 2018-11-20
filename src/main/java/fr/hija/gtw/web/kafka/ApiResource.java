package fr.hija.gtw.web.kafka;

import com.codahale.metrics.annotation.Timed;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.messaging.MessageChannel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for view and managing Log Level at runtime.
 *
 * PATH MUST BE LOWERCASE !!!
 */

@RestController
@RequestMapping("/api/kafka")
public class ApiResource{

    private MessageChannel scalaChannel;
    private MessageChannel defaultChannel;

    public ApiResource(ProducerChannel channel) {
        this.scalaChannel = channel.scalaMessageChannel();
        this.defaultChannel = channel.defaultMessageChannel();
    }

    @GetMapping("/mock/scala/{count}")
    @Timed
    public void produceScala(@PathVariable int count) {
        while(count > 0) {
            scalaChannel.send(MessageBuilder.withPayload(new MessageModel().setMessage("Hello Scala I'm GTW !: " + count)).build());
            count--;
        }
    }

    @GetMapping("/mock/default/{count}")
    @Timed
    public void produceDefault(@PathVariable int count) {
        while(count > 0) {
            defaultChannel.send(MessageBuilder.withPayload(new MessageModel().setMessage("Hello world I'm GTW!: " + count)).build());
            count--;
        }
    }

}
