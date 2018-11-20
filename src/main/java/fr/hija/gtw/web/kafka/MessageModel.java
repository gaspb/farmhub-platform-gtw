package fr.hija.gtw.web.kafka;

public class MessageModel {

    private String message;

    public MessageModel() {
    }

    public String getMessage() {
        return message;
    }

    public MessageModel setMessage(String message) {
        this.message = message;
        return this;
    }
}
