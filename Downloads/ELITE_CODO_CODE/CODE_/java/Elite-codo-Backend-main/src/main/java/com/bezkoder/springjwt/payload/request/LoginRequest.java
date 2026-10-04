package com.bezkoder.springjwt.payload.request;

import javax.validation.constraints.NotBlank;

import lombok.ToString;

@ToString
public class LoginRequest {
    
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    private String role;

    // ========== DEVICE FIELDS ==========
    private String deviceId;
    private String deviceType;
    private String deviceName;
    private String fcmToken;
    private String userAgent;
    private String ipAddress;
    // ==================================

 // In LoginRequest.java — add this field
    private boolean forceLogout = false;

    public boolean isForceLogout() {
        return forceLogout;
    }

    public void setForceLogout(boolean forceLogout) {
        this.forceLogout = forceLogout;
    }
    // Getters and Setters
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getDeviceType() {
        return deviceType;
    }

    public void setDeviceType(String deviceType) {
        this.deviceType = deviceType;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public void setDeviceName(String deviceName) {
        this.deviceName = deviceName;
    }

    public String getFcmToken() {
        return fcmToken;
    }

    public void setFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
}