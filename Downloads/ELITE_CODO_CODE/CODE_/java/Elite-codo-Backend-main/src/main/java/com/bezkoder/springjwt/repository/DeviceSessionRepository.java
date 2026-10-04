package com.bezkoder.springjwt.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bezkoder.springjwt.models.DeviceSession;

public interface DeviceSessionRepository extends JpaRepository<DeviceSession, Long> {
	
	// ============================================================
	// SESSION DEACTIVATION METHODS
	// ============================================================
	
	// Deactivate all sessions for a user
	@Modifying
	@Transactional
	@Query("UPDATE DeviceSession ds SET ds.active = false, ds.logoutTime = :logoutTime WHERE ds.userId = :userId AND ds.active = true")
	int deactivateAllSessions(@Param("userId") Long userId, @Param("logoutTime") LocalDateTime logoutTime);
	
	// Deactivate specific session by user and device
	@Modifying
	@Transactional
	@Query("UPDATE DeviceSession ds SET ds.active = false, ds.logoutTime = :logoutTime WHERE ds.userId = :userId AND ds.deviceId = :deviceId AND ds.active = true")
	int deactivateSession(@Param("userId") Long userId, @Param("deviceId") String deviceId, @Param("logoutTime") LocalDateTime logoutTime);
	
	// Force logout all devices except current device
	@Modifying
	@Transactional
	@Query("UPDATE DeviceSession ds SET ds.active = false, ds.logoutTime = :logoutTime " +
	       "WHERE ds.userId = :userId AND ds.deviceId <> :currentDeviceId AND ds.active = true")
	int forceLogoutOtherDevices(@Param("userId") Long userId,
	                            @Param("currentDeviceId") String currentDeviceId,
	                            @Param("logoutTime") LocalDateTime logoutTime);
	
	// Deactivate sessions older than given time
	@Modifying
	@Transactional
	@Query("UPDATE DeviceSession ds SET ds.active = false, ds.logoutTime = :logoutTime " +
	       "WHERE ds.userId = :userId AND ds.active = true AND ds.loginTime < :cutoffTime")
	int deactivateSessionsOlderThan(@Param("userId") Long userId, 
	                                @Param("cutoffTime") LocalDateTime cutoffTime,
	                                @Param("logoutTime") LocalDateTime logoutTime);
	
	// ============================================================
	// QUERY METHODS
	// ============================================================
	
	// Active sessions for a user
	List<DeviceSession> findByUserIdAndActiveTrue(Long userId);
	
	// Active session for a specific user + device
	Optional<DeviceSession> findByUserIdAndDeviceIdAndActiveTrue(Long userId, String deviceId);
	
	// Active session for a device (any user)
	Optional<DeviceSession> findByDeviceIdAndActiveTrue(String deviceId);
	
	// Check if user has any active session
	boolean existsByUserIdAndActiveTrue(Long userId);
	
	// Count active sessions for a user
	int countByUserIdAndActiveTrue(Long userId);
	
	// Get active sessions ordered by login time (newest first)
	@Query("SELECT ds FROM DeviceSession ds WHERE ds.userId = :userId AND ds.active = true ORDER BY ds.loginTime DESC")
	List<DeviceSession> findActiveSessionsOrderByLoginTime(@Param("userId") Long userId);
	
	// Get only the most recent active session for a user
	@Query(value = "SELECT * FROM device_sessions ds WHERE ds.user_id = :userId AND ds.is_active = 1 ORDER BY ds.login_time DESC LIMIT 1", nativeQuery = true)
	Optional<DeviceSession> findMostRecentActiveSession(@Param("userId") Long userId);
	
	// Other active devices for a user (excluding current device)
	@Query("SELECT ds FROM DeviceSession ds " +
	       "WHERE ds.userId = :userId AND ds.deviceId <> :deviceId AND ds.active = true")
	List<DeviceSession> findOtherActiveDevices(@Param("userId") Long userId,
	                                           @Param("deviceId") String deviceId);
	
	// Find active session by device ID
	@Query("SELECT ds FROM DeviceSession ds WHERE ds.deviceId = :deviceId AND ds.active = true")
	Optional<DeviceSession> findActiveByDeviceId(@Param("deviceId") String deviceId);
	
	// Expired sessions (inactive cutoff)
	@Query("SELECT ds FROM DeviceSession ds " +
	       "WHERE ds.active = true AND ds.lastActivity < :cutoffTime")
	List<DeviceSession> findExpiredSessions(@Param("cutoffTime") LocalDateTime cutoffTime);
	
	// Deactivate expired sessions
	@Modifying
	@Transactional
	@Query("UPDATE DeviceSession ds SET ds.active = false, ds.logoutTime = :logoutTime " +
	       "WHERE ds.active = true AND ds.lastActivity < :cutoffTime")
	int deactivateExpiredSessions(@Param("cutoffTime") LocalDateTime cutoffTime,
	                              @Param("logoutTime") LocalDateTime logoutTime);
	
	// Deactivate device by device ID only
	@Modifying
	@Transactional
	@Query("UPDATE DeviceSession ds SET ds.active = false, ds.logoutTime = :logoutTime " +
	       "WHERE ds.deviceId = :deviceId AND ds.active = true")
	int deactivateDeviceByDeviceId(@Param("deviceId") String deviceId,
	                               @Param("logoutTime") LocalDateTime logoutTime);
	
	// Find all active sessions for a user with device details
	@Query("SELECT ds FROM DeviceSession ds WHERE ds.userId = :userId AND ds.active = true")
	List<DeviceSession> findAllActiveSessionsByUserId(@Param("userId") Long userId);
	
	// Check if a specific device session is active
	@Query("SELECT CASE WHEN COUNT(ds) > 0 THEN true ELSE false END FROM DeviceSession ds WHERE ds.userId = :userId AND ds.deviceId = :deviceId AND ds.active = true")
	boolean isSessionActive(@Param("userId") Long userId, @Param("deviceId") String deviceId);
}