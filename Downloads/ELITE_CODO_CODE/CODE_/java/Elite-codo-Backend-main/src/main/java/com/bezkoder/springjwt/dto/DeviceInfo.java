package com.bezkoder.springjwt.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DeviceInfo {
	private String deviceId;
    private String deviceType;
    private String deviceName;
    private String fcmToken;
    private String userAgent;
    private String ipAddress;
    
}