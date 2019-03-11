package fr.hija.gtw.web.rest.vm;

import java.io.Serializable;

public class Base64VM implements Serializable{
    private String base64;
    private String id;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBase64() {
        return base64;
    }

    public void setBase64(String base64) {
        this.base64 = base64;
    }

    public Base64VM(String id, String base64) {
        this.id = id;
        this.base64 = base64;
    }

    public Base64VM() {
    }
}
