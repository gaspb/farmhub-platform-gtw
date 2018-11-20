package fr.hija.gtw.web.websocket.dto;

import java.io.Serializable;

/**
 * DTO for storing a user's activity.
 */
public class PipelineMessageDTO implements Serializable{


    private String body;

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }
    private String sessionId;

    private String userLogin;

    private String ipAddress;

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getUserLogin() {
        return userLogin;
    }

    public void setUserLogin(String userLogin) {
        this.userLogin = userLogin;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    @Override
    public String toString() {
        return "Ws1MessageDTO{" +
            "body='" + body + '\'' +
            "sessionId='" + sessionId + '\'' +
            ", userLogin='" + userLogin + '\'' +
            ", ipAddress='" + ipAddress + '\'' +
            '}';
    }
}
