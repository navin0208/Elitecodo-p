// src/main/java/com/bezkoder/springjwt/models/DeviceSession.java
package com.bezkoder.springjwt.models;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.PrePersist;
import javax.persistence.PreUpdate;
import javax.persistence.Table;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "device_sessions",
        indexes = {
                @Index(name="idx_user_device", columnList="user_id,device_id"),
                @Index(name="idx_active",      columnList="is_active"),
                @Index(name="idx_role",        columnList="role")
        })
@Getter @Setter @NoArgsConstructor
public class DeviceSession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ERole role;

    @Column(name="device_id", nullable = false)
    private String deviceId;

    // ========== ADD THESE MISSING FIELDS ==========
    @Column(name="device_type", length = 50)
    private String deviceType;
    
    @Column(name="device_name", length = 255)
    private String deviceName;
    
    @Column(name="fcm_token", length = 500)
    private String fcmToken;
    // ============================================

    @Column(name="user_agent", length=1000)
    private String userAgent;

    @Column(name="ip_address", length=45)
    private String ipAddress;

    @Column(name="login_time", nullable = false)
    private LocalDateTime loginTime;

    @Column(name="last_activity", nullable = false)
    private LocalDateTime lastActivity;

    @Column(name="logout_time")
    private LocalDateTime logoutTime;

    @Column(name="is_active", nullable = false)
    private boolean active = true;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;

    /* ---------- JPA callbacks ---------- */
    @PrePersist
    public void onCreate() {
        this.createdAt = this.updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}