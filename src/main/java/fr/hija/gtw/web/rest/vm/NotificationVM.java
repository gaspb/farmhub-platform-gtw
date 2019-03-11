package fr.hija.gtw.web.rest.vm;

import java.io.Serializable;

public class NotificationVM implements Serializable{

    public String fromUser;
    public String toUser;
    public String type;//tec or usr
    public String name;//ex update_team
    public String value;
    public String icon;
    public String text;
    public String time;
    public String meta;

    public NotificationVM() {
    }

    public NotificationVM(String fromUser, String toUser,String name, String type, String value, String icon, String text, String time, String meta) {
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.type = type;
        this.name = name;
        this.value = value;
        this.icon = icon;
        this.text = text;
        this.meta = meta;
        this.time = time;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getMeta() {
        return meta;
    }

    public void setMeta(String meta) {
        this.meta = meta;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFromUser() {
        return fromUser;
    }

    public void setFromUser(String fromUser) {
        this.fromUser = fromUser;
    }

    public String getToUser() {
        return toUser;
    }

    public void setToUser(String toUser) {
        this.toUser = toUser;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
