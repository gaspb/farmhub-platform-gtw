package fr.hija.gtw.web.kafka;

import com.codahale.metrics.annotation.Timed;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.messaging.MessageChannel;
import org.springframework.scheduling.quartz.SimpleThreadPoolTaskExecutor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Observable;
import java.util.Random;
import java.util.concurrent.*;
import java.util.stream.IntStream;

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
    private ScheduledExecutorService executor;
    private int i = 0;

    public ApiResource(ProducerChannel channel) {
        this.scalaChannel = channel.scalaMessageChannel();
        this.defaultChannel = channel.defaultMessageChannel();
    }

    @PostMapping("/mock/scala/source/int")
    @Timed
    public void mockScalaIntSource(@RequestBody MockScalaIntSourceParameters parameters) {
        if (executor!=null) {
            executor.shutdown();
        }
        i=0;
        Random rand = new Random();
        ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
        ScheduledFuture<?> task = executor.scheduleWithFixedDelay(() -> {
            StringBuilder sb = new StringBuilder("[");
            sb.append(rand.nextInt());
            for (int x=0; x<parameters.getArrayLength();x++) {
                sb.append(",")
                  .append(rand.nextInt());
            }
            sb.append("]");

            scalaChannel.send(MessageBuilder.withPayload(
                new MessageModel().setMessage(sb.toString())
            ).build());
            if(++i>=parameters.getIterations()) {
                executor.shutdown();
            }
        }, 500, parameters.getDelay(), TimeUnit.MILLISECONDS);
    }
    @PostMapping("/mock/scala/source/byte")
    @Timed
    public void mockScalaByteSource(@RequestBody MockScalaIntSourceParameters parameters) {
        if (executor!=null) {
            executor.shutdown();
        }
        i=0;
        Random rand = new Random();
        ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
        ScheduledFuture<?> task = executor.scheduleWithFixedDelay(() -> {

            byte[] bytes = new byte[parameters.getArrayLength()];
            rand.nextBytes(bytes);
            StringBuilder sb = new StringBuilder("[");
            sb.append(bytes[0]);
            for (int x=1; x<parameters.getArrayLength()-1;x++) {
                sb.append(",")
                    .append(bytes[x]);
            }
            sb.append("]");

            scalaChannel.send(MessageBuilder.withPayload(
                new MessageModel().setMessage(sb.toString())
            ).build());
            if(++i>=parameters.getIterations()) {
                executor.shutdown();
            }
        }, 500, parameters.getDelay(), TimeUnit.MILLISECONDS);
    }
    @PostMapping("/mock/scala/source/scatter")
    @Timed
    public void mockScalaScatterSource(@RequestBody MockScalaIntSourceParameters parameters) {
        if (executor!=null) {
            executor.shutdown();
        }
        i=0;
        Random rand = new Random();
        ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
        ScheduledFuture<?> task = executor.scheduleWithFixedDelay(() -> {

            byte[] bytes = new byte[parameters.getArrayLength()];
            rand.nextBytes(bytes);
            StringBuilder sb = new StringBuilder("[");
            for (int x=0; x<parameters.getArrayLength();x++) {

                if (x!=0) {
                    sb.append(",");
                }
                sb.append("{\"x\":")
                    .append(rand.nextInt(20))
                    .append(",\"y\":")
                    .append(rand.nextInt(200))
                    .append("}");
            }
            sb.append("]");

            scalaChannel.send(MessageBuilder.withPayload(
                new MessageModel().setMessage(sb.toString())
            ).build());
            if(++i>=parameters.getIterations()) {
                executor.shutdown();
            }
        }, 500, parameters.getDelay(), TimeUnit.MILLISECONDS);
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
class MockScalaIntSourceParameters {
    private int arrayLength;
    private int iterations;
    private int delay;

    public MockScalaIntSourceParameters(int arrayLength, int iterations, int delay) {
        this.arrayLength = arrayLength;
        this.iterations = iterations;
        this.delay = delay;
    }

    public MockScalaIntSourceParameters() {
    }

    public void setArrayLength(int arrayLength) {
        this.arrayLength = arrayLength;
    }

    public void setIterations(int iterations) {
        this.iterations = iterations;
    }
    public void setDelay(int delay) {
        this.delay = delay;
    }

    public int getArrayLength() {
        return arrayLength;
    }

    public int getIterations() {
        return iterations;
    }

    public int getDelay() {
        return delay;
    }
}
