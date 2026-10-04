package com.bezkoder.springjwt.services.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bezkoder.springjwt.dto.DeviceCheckResponse;
import com.bezkoder.springjwt.dto.DeviceInfo;
import com.bezkoder.springjwt.models.DeviceSession;
import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.repository.DeviceSessionRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class DeviceManagementService {

    @Autowired
    private DeviceSessionRepository repo;

    private boolean allowsMultiple(ERole role) {
        return role == ERole.ROLE_SUPER_ADMIN || role == ERole.ROLE_PARENT;
    }

    public boolean canUserLoginFromDevice(Long uid, ERole role, DeviceInfo info) {
        if (allowsMultiple(role)) return true;

        // ✅ FIXED: was repo.findActiveByUser()
        List<DeviceSession> actives = repo.findByUserIdAndActiveTrue(uid);

        if (actives.isEmpty()) return true;

        return actives.stream()
                .anyMatch(s -> s.getDeviceId().equals(info.getDeviceId()));
    }

    public DeviceSession registerUserDevice(Long uid, ERole role, DeviceInfo info) {

        // ✅ FIXED: was repo.findActiveByUserAndDevice()
        Optional<DeviceSession> existing =
                repo.findByUserIdAndDeviceIdAndActiveTrue(uid, info.getDeviceId());

        if (existing.isPresent()) {
            DeviceSession s = existing.get();
            s.setLastActivity(LocalDateTime.now());
            s.setUserAgent(info.getUserAgent());
            s.setIpAddress(info.getIpAddress());
            s.setDeviceType(info.getDeviceType());
            s.setDeviceName(info.getDeviceName());
            return repo.save(s);
        }

        if (!allowsMultiple(role)) {
            // ✅ findOtherActive already matches repo - no change needed
            List<DeviceSession> otherDevices = repo.findOtherActiveDevices(uid, info.getDeviceId());
            otherDevices.forEach(ds -> {
                ds.setActive(false);
                ds.setLogoutTime(LocalDateTime.now());
            });
            repo.saveAll(otherDevices);
        }

        DeviceSession s = new DeviceSession();
        s.setUserId(uid);
        s.setRole(role);
        s.setDeviceId(info.getDeviceId());
        s.setDeviceType(info.getDeviceType());
        s.setDeviceName(info.getDeviceName());
        s.setFcmToken(info.getFcmToken());
        s.setUserAgent(info.getUserAgent());
        s.setIpAddress(info.getIpAddress());
        s.setLoginTime(LocalDateTime.now());
        s.setLastActivity(LocalDateTime.now());
        s.setActive(true);

        return repo.save(s);
    }

    public int forceLogoutOtherDevices(Long uid, String currentDid) {
        // ✅ findOtherActive already matches repo - no change needed
        List<DeviceSession> others = repo.findOtherActiveDevices(uid, currentDid);
        others.forEach(s -> {
            s.setActive(false);
            s.setLogoutTime(LocalDateTime.now());
        });
        repo.saveAll(others);
        return others.size();
    }

    public List<DeviceSession> getUserActiveDevices(Long uid) {
        // ✅ FIXED: was repo.findActiveByUser()
        return repo.findByUserIdAndActiveTrue(uid);
    }

    public boolean validateUserSession(Long uid, String did, String ignored) {
        // ✅ FIXED: was repo.findActiveByUserAndDevice()
        return repo.findByUserIdAndDeviceIdAndActiveTrue(uid, did).isPresent();
    }

    public Map<String, Object> getDeviceRestrictionsByRole(String roleStr) {
        ERole r = ERole.valueOf(roleStr);
        boolean multi = allowsMultiple(r);

        Map<String, Object> result = new HashMap<>();
        result.put("role", r);
        result.put("deviceLimit", multi ? -1 : 1);
        result.put("allowsMultipleDevices", multi);
        result.put("description", multi
                ? "Multiple simultaneous devices allowed"
                : "Only one active device at a time");
        return result;
    }

    public DeviceCheckResponse isDeviceRegistered(Long userId, String deviceId) {
        try {
            // ✅ FIXED: was repo.findActiveByUserAndDevice()
            Optional<DeviceSession> opt =
                    repo.findByUserIdAndDeviceIdAndActiveTrue(userId, deviceId);

            if (opt.isPresent()) {
                DeviceSession session = opt.get();
                session.setLastActivity(LocalDateTime.now());
                repo.save(session);

                return DeviceCheckResponse.builder()
                        .registered(true)
                        .canLogin(true)
                        .message("Device is registered and active")
                        .lastActive(session.getLastActivity())
                        .build();
            }

            return DeviceCheckResponse.builder()
                    .registered(false)
                    .canLogin(false)
                    .message("Device is not registered or inactive")
                    .build();

        } catch (Exception ex) {
            return DeviceCheckResponse.builder()
                    .registered(false)
                    .canLogin(false)
                    .message("Error checking device registration")
                    .build();
        }
    }

    public boolean logoutDevice(Long userId, String deviceId) {
        try {
            // ✅ FIXED: was repo.findActiveByUserAndDevice()
            return repo.findByUserIdAndDeviceIdAndActiveTrue(userId, deviceId)
                    .map(s -> {
                        s.setActive(false);
                        s.setLogoutTime(LocalDateTime.now());
                        repo.save(s);
                        return true;
                    })
                    .orElse(false);
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean hasActiveSession(Long userId) {
        // ✅ FIXED: was repo.findActiveByUser()
        return !repo.findByUserIdAndActiveTrue(userId).isEmpty();
        // alternatively: return repo.existsByUserIdAndActiveTrue(userId);
    }

    public boolean isDeviceActive(Long userId, String deviceId) {
        // ✅ FIXED: was repo.findActiveByUserAndDevice()
        return repo.findByUserIdAndDeviceIdAndActiveTrue(userId, deviceId).isPresent();
    }

    public boolean isDeviceUsedByOtherUser(String deviceId, Long currentUserId) {
        // ✅ FIXED: was repo.findActiveByDeviceId()
        Optional<DeviceSession> session = repo.findByDeviceIdAndActiveTrue(deviceId);
        return session.isPresent() && !session.get().getUserId().equals(currentUserId);
    }

    public int getActiveSessionCount(Long userId) {
        // ✅ FIXED: was repo.findActiveByUser()
        return repo.findByUserIdAndActiveTrue(userId).size();
    }

    public int deactivateAllUserSessions(Long userId) {
        // ✅ FIXED: was repo.findActiveByUser()
        List<DeviceSession> activeSessions = repo.findByUserIdAndActiveTrue(userId);
        activeSessions.forEach(s -> {
            s.setActive(false);
            s.setLogoutTime(LocalDateTime.now());
        });
        repo.saveAll(activeSessions);
        return activeSessions.size();
    }

    public void cleanupExpired() {
        // ✅ findExpired already matches repo - no change needed
        List<DeviceSession> expired = repo.findExpiredSessions(LocalDateTime.now().minusHours(24));
        expired.forEach(s -> {
            s.setActive(false);
            s.setLogoutTime(LocalDateTime.now());
        });
        repo.saveAll(expired);
    }
}