package com.bezkoder.springjwt.controllers;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import javax.transaction.Transactional;
import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
//Add these imports at the top of your AuthController.java
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.bezkoder.springjwt.dto.ApiResponse;
import com.bezkoder.springjwt.dto.DeviceAccessRequest;
import com.bezkoder.springjwt.dto.DeviceCheckResponse;
import com.bezkoder.springjwt.dto.ForceLogoutRequest;
import com.bezkoder.springjwt.dto.LogoutDeviceRequest;
import com.bezkoder.springjwt.dto.RescheduleTestRequest;
import com.bezkoder.springjwt.models.DeviceSession;
import com.bezkoder.springjwt.models.ERole;
import com.bezkoder.springjwt.models.User;
import com.bezkoder.springjwt.payload.request.BulkParentStatusChangeRequest;
import com.bezkoder.springjwt.payload.request.BulkUserChangeStatusRequest;
import com.bezkoder.springjwt.payload.request.ChangePasswordRequest;
import com.bezkoder.springjwt.payload.request.ForgotPasswordRequest;
import com.bezkoder.springjwt.payload.request.LoginRequest;
import com.bezkoder.springjwt.payload.request.NewPasswordRequest;
import com.bezkoder.springjwt.payload.request.ParentInformationUpdateRequest;
import com.bezkoder.springjwt.payload.request.SignupRequest;
import com.bezkoder.springjwt.payload.request.StudentAssignmentsRequest;
import com.bezkoder.springjwt.payload.request.TeacherRequestAssignment;
import com.bezkoder.springjwt.payload.request.UpdateExpiryRequest;
import com.bezkoder.springjwt.payload.request.UpdateInstituteRequest;
import com.bezkoder.springjwt.payload.request.UpdateStatusRequest;
import com.bezkoder.springjwt.payload.request.UpdateStudentRequest;
import com.bezkoder.springjwt.payload.request.UpdateTeacherRequest;
import com.bezkoder.springjwt.payload.request.VerificationOTPRequest;
import com.bezkoder.springjwt.payload.response.ActivationCountResponse;
import com.bezkoder.springjwt.payload.response.CountOfStudentTeacherQuestionResponse;
import com.bezkoder.springjwt.payload.response.DashBoardDetails;
import com.bezkoder.springjwt.payload.response.EntranceExamResponse;
import com.bezkoder.springjwt.payload.response.ExpiringUserResponse;
import com.bezkoder.springjwt.payload.response.InstituteCountsResponse;
import com.bezkoder.springjwt.payload.response.InstituteDetailsResponse;
import com.bezkoder.springjwt.payload.response.JwtResponse;
import com.bezkoder.springjwt.payload.response.MainResponse;
import com.bezkoder.springjwt.payload.response.MessageResponse;
import com.bezkoder.springjwt.payload.response.ParentDetails;
import com.bezkoder.springjwt.payload.response.PendingRolesList;
import com.bezkoder.springjwt.payload.response.RolesActivitiesResponse;
import com.bezkoder.springjwt.payload.response.StandardMasterResponse;
import com.bezkoder.springjwt.payload.response.StandardResponse1;
import com.bezkoder.springjwt.payload.response.StandardSubjectResponse;
import com.bezkoder.springjwt.payload.response.StudentDetailsResponse;
import com.bezkoder.springjwt.payload.response.StudentMappedData;
import com.bezkoder.springjwt.payload.response.SubjectMastersResponse;
import com.bezkoder.springjwt.payload.response.TeacherAssessmentDetails;
import com.bezkoder.springjwt.payload.response.TeacherDashboardCountResponse;
import com.bezkoder.springjwt.payload.response.TeacherMappedData;
import com.bezkoder.springjwt.payload.response.TestNameResponse;
import com.bezkoder.springjwt.payload.response.UserAccess;
import com.bezkoder.springjwt.payload.response.UserDetails;
import com.bezkoder.springjwt.payload.response.UserDetails1;
import com.bezkoder.springjwt.payload.response.UserInfo;
import com.bezkoder.springjwt.payload.response.UserManagementResponse;
import com.bezkoder.springjwt.payload.response.UserStatResponse;
import com.bezkoder.springjwt.payload.response.UsersCountResponse;
import com.bezkoder.springjwt.payload.response.VerificationOTPResponse;
import com.bezkoder.springjwt.repository.DeviceSessionRepository;
import com.bezkoder.springjwt.repository.InstituteRepository;
import com.bezkoder.springjwt.repository.RoleRepository;
import com.bezkoder.springjwt.repository.SubjectRepository;
import com.bezkoder.springjwt.repository.UserRepository;
import com.bezkoder.springjwt.security.jwt.JwtUtils;
import com.bezkoder.springjwt.security.services.UserDetailsImpl;
import com.bezkoder.springjwt.services.UserService;
import com.bezkoder.springjwt.services.impl.DeviceManagementService;
import com.bezkoder.springjwt.services.impl.ProfilePatternResponse;
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    private DeviceManagementService deviceManagementService;

    @Autowired
    private UserService userService;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private InstituteRepository instituteRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private DeviceSessionRepository deviceSessionRepository;

    @PostMapping("/signin")
    @Transactional
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        try {
            System.out.println("\n========== SIGNIN START ==========");

            // =========================================================
            // 1. Validate Device ID
            // =========================================================
            if (loginRequest.getDeviceId() == null ||
                    loginRequest.getDeviceId().trim().isEmpty()) {

                System.out.println("LOGIN BLOCKED - Device ID is missing");

                return ResponseEntity.badRequest()
                        .body(new MainResponse(
                                "Device ID is required.",
                                400,
                                false
                        ));
            }

            System.out.println("Login username/email: " + loginRequest.getUsername());
            System.out.println("Login role received: " + loginRequest.getRole());
            System.out.println("Login device ID: " + loginRequest.getDeviceId());

            // =========================================================
            // 2. Role validation
            // =========================================================
            ERole roleEnum;

            try {

                roleEnum = ERole.valueOf(
                        "ROLE_" + loginRequest.getRole().toUpperCase()
                );

                System.out.println("Role converted successfully: " + roleEnum);

            } catch (Exception e) {

                System.out.println(
                        "LOGIN BLOCKED - Invalid role: "
                                + loginRequest.getRole()
                );

                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Invalid role"));
            }

            // =========================================================
            // 3. Find user
            // =========================================================
            Optional<User> userOpt = userRepository
                    .findByEmailAndRole(
                            loginRequest.getUsername(),
                            roleEnum
                    );

            if (!userOpt.isPresent()) {

                System.out.println(
                        "LOGIN BLOCKED - User not found: "
                                + loginRequest.getUsername()
                );

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("User not found"));
            }

            User user = userOpt.get();

            System.out.println("User found:");
            System.out.println("User ID: " + user.getId());
            System.out.println("User Email: " + user.getEmail());
            System.out.println("User Status: " + user.getStatus());
            System.out.println("User Expiry Date: " + user.getExpiryDate());

            // =========================================================
            // 4. Validate password
            // =========================================================
            if (!encoder.matches(
                    loginRequest.getPassword(),
                    user.getPassword())) {

                System.out.println(
                        "LOGIN BLOCKED - Invalid password for user ID: "
                                + user.getId()
                );

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid password"));
            }

            System.out.println(
                    "Password validation successful for user ID: "
                            + user.getId()
            );

            // =========================================================
// 5. CHECK SUBSCRIPTION EXPIRY
// =========================================================

            Date currentDate = new Date();

            System.out.println("========== EXPIRY CHECK ==========");
            System.out.println("User ID: " + user.getId());
            System.out.println("Current Date: " + currentDate);
            System.out.println("Expiry Date: " + user.getExpiryDate());

            if (user.getExpiryDate() != null) {

                // expiryDate is @Temporal(TemporalType.DATE),
                // so compare only YYYY-MM-DD and ignore time.
                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd");

                String currentDateOnly = dateFormat.format(currentDate);
                String expiryDateOnly = dateFormat.format(user.getExpiryDate());

                System.out.println("Current Date Only: " + currentDateOnly);
                System.out.println("Expiry Date Only: " + expiryDateOnly);

                Date currentOnly = dateFormat.parse(currentDateOnly);
                Date expiryOnly = dateFormat.parse(expiryDateOnly);

                boolean expired = currentOnly.after(expiryOnly);

                if (expired) {

                    System.out.println(
                            "LOGIN BLOCKED - SUBSCRIPTION EXPIRED"
                    );

                    System.out.println(
                            "User ID: " + user.getId()
                    );

                    System.out.println(
                            "Expiry Date: " + expiryDateOnly
                    );

                    System.out.println(
                            "Current Date: " + currentDateOnly
                    );

                    System.out.println(
                            "========== LOGIN FAILED - EXPIRED USER ==========\n"
                    );

                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(new MainResponse(
                                    "Your subscription has expired. Please renew your subscription.",
                                    403,
                                    false,
                                    user.getId()
                            ));
                }

                System.out.println(
                        "Subscription is ACTIVE for user ID: "
                                + user.getId()
                );

            } else {

                System.out.println(
                        "WARNING - Expiry date is NULL for user ID: "
                                + user.getId()
                );
            }

            System.out.println("========== EXPIRY CHECK PASSED ==========");

            // =========================================================
            // 6. User/device login information
            // =========================================================
            System.out.println(
                    "User: " + user.getId()
                            + " login from device: "
                            + loginRequest.getDeviceId()
            );

            // =========================================================
            // 7. Check active sessions
            // =========================================================
            List<DeviceSession> activeSessions =
                    deviceSessionRepository
                            .findByUserIdAndActiveTrue(user.getId());

            System.out.println(
                    "Active sessions found: "
                            + activeSessions.size()
            );

            // =========================================================
            // 8. Session management configuration
            // =========================================================
            boolean forceLogoutOnDifferentDevice = true;
            boolean forceLogoutOnSameDevice = false;

            // =========================================================
            // 9. Check existing active sessions
            // =========================================================
            if (!activeSessions.isEmpty()
                    && !loginRequest.isForceLogout()) {

                boolean hasDifferentDevice =
                        activeSessions.stream()
                                .anyMatch(s ->
                                        !s.getDeviceId()
                                                .equals(loginRequest.getDeviceId())
                                );

                boolean shouldBlock = false;

                if (hasDifferentDevice
                        && forceLogoutOnDifferentDevice) {

                    shouldBlock = true;

                    System.out.println(
                            "Different device detected - blocking login"
                    );

                } else if (!hasDifferentDevice
                        && forceLogoutOnSameDevice) {

                    shouldBlock = true;

                    System.out.println(
                            "Same device but force logout enabled - blocking login"
                    );
                }

                if (shouldBlock) {

                    System.out.println(
                            "LOGIN BLOCKED - Existing active session"
                    );

                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new MainResponse(
                                    "Already logged in on "
                                            + (hasDifferentDevice
                                            ? "another device"
                                            : "this device")
                                            + ". Use force logout.",
                                    401,
                                    false,
                                    user.getId()
                            ));
                }
            }

            // =========================================================
            // 10. Handle force logout
            // =========================================================
            if (loginRequest.isForceLogout()) {

                int count =
                        deviceSessionRepository.deactivateAllSessions(
                                user.getId(),
                                LocalDateTime.now()
                        );

                System.out.println(
                        "Force logout - cleared "
                                + count
                                + " sessions"
                );

                // Notify previous session
                if (!activeSessions.isEmpty()) {

                    notifyForceLogout(
                            user.getId(),
                            loginRequest.getDeviceId()
                    );
                }

            }

            // =========================================================
            // 11. Deactivate existing sessions
            // =========================================================
            else if (!activeSessions.isEmpty()) {

                int count =
                        deviceSessionRepository.deactivateAllSessions(
                                user.getId(),
                                LocalDateTime.now()
                        );

                System.out.println(
                        "Deactivated "
                                + count
                                + " existing sessions to create new one"
                );

                // Notify previous session
                notifyForceLogout(
                        user.getId(),
                        loginRequest.getDeviceId()
                );
            }

            // =========================================================
            // 12. Create new device session
            // =========================================================
            DeviceSession newSession = new DeviceSession();

            newSession.setUserId(user.getId());
            newSession.setRole(roleEnum);
            newSession.setDeviceId(loginRequest.getDeviceId());
            newSession.setDeviceType(loginRequest.getDeviceType());
            newSession.setDeviceName(loginRequest.getDeviceName());
            newSession.setFcmToken(loginRequest.getFcmToken());
            newSession.setUserAgent(loginRequest.getUserAgent());
            newSession.setIpAddress(loginRequest.getIpAddress());
            newSession.setLoginTime(LocalDateTime.now());
            newSession.setLastActivity(LocalDateTime.now());
            newSession.setActive(true);
            newSession.setCreatedAt(LocalDateTime.now());
            newSession.setUpdatedAt(LocalDateTime.now());

            deviceSessionRepository.save(newSession);

            System.out.println(
                    "New session created with ID: "
                            + newSession.getId()
            );

            // =========================================================
            // 13. Generate JWT
            // =========================================================
            UserDetailsImpl userDetails =
                    UserDetailsImpl.build(user);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            String jwt =
                    jwtUtils.generateJwtToken(authentication);

            System.out.println(
                    "JWT generated successfully for user ID: "
                            + user.getId()
            );

            // =========================================================
            // 14. Update user login information
            // =========================================================
            user.setLastLogin(user.getCurrentLogin());
            user.setCurrentLogin(new Date());
            user.setIsLoggedIn(true);

            userRepository.save(user);

            System.out.println(
                    "User login information updated"
            );

            // =========================================================
            // 15. LOGIN SUCCESS
            // =========================================================
            System.out.println(
                    "========== LOGIN SUCCESS ==========\n"
            );

            // =========================================================
            // 16. Return JWT response
            // =========================================================
            return ResponseEntity.ok(
                    new JwtResponse(
                            jwt,
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getProfilePicture(),
                            user.getWatermarkImage(),
                            user.getLogoImage(),
                            user.getColorTheme(),
                            userDetails.getAuthorities()
                                    .stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .collect(Collectors.toList()),
                            user.getClassName()
                    )
            );

        } catch (Exception e) {

            System.out.println(
                    "========== SIGNIN ERROR =========="
            );

            e.printStackTrace();

            return ResponseEntity.status(
                    HttpStatus.INTERNAL_SERVER_ERROR
            ).body(
                    new MainResponse(
                            "Error: " + e.getMessage(),
                            500,
                            false
                    )
            );
        }
    }

//    @PostMapping("/signin")
//    @Transactional
//    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
//        try {
//            System.out.println("\n========== SIGNIN START ==========");
//
//            // Validate Device ID
//            if (loginRequest.getDeviceId() == null || loginRequest.getDeviceId().isEmpty()) {
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse("Device ID is required.", 400, false));
//            }
//
//            // Role validation
//            ERole roleEnum;
//            try {
//                roleEnum = ERole.valueOf("ROLE_" + loginRequest.getRole().toUpperCase());
//            } catch (Exception e) {
//                return ResponseEntity.badRequest()
//                        .body(new MessageResponse("Invalid role"));
//            }
//
//            // Find user
//            Optional<User> userOpt = userRepository
//                    .findByEmailAndRole(loginRequest.getUsername(), roleEnum);
//
//            if (!userOpt.isPresent()) {
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                        .body(new MessageResponse("User not found"));
//            }
//
//            User user = userOpt.get();
//
//            // Validate password
//            if (!encoder.matches(loginRequest.getPassword(), user.getPassword())) {
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                        .body(new MessageResponse("Invalid password"));
//            }
//
//            System.out.println("User: " + user.getId() + " login from device: " + loginRequest.getDeviceId());
//
//            // Check active sessions
//            List<DeviceSession> activeSessions = deviceSessionRepository
//                    .findByUserIdAndActiveTrue(user.getId());
//
//            System.out.println("Active sessions found: " + activeSessions.size());
//
//            // Session management logic - Define configuration values
//            boolean forceLogoutOnDifferentDevice = true;
//            boolean forceLogoutOnSameDevice = false;
//
//            // Check if there are active sessions and force logout is not requested
//            if (!activeSessions.isEmpty() && !loginRequest.isForceLogout()) {
//                boolean hasDifferentDevice = activeSessions.stream()
//                        .anyMatch(s -> !s.getDeviceId().equals(loginRequest.getDeviceId()));
//
//                boolean shouldBlock = false;
//
//                if (hasDifferentDevice && forceLogoutOnDifferentDevice) {
//                    shouldBlock = true;
//                    System.out.println("Different device detected - blocking login");
//                } else if (!hasDifferentDevice && forceLogoutOnSameDevice) {
//                    shouldBlock = true;
//                    System.out.println("Same device but force logout enabled - blocking login");
//                }
//
//                if (shouldBlock) {
//                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                            .body(new MainResponse(
//                                    "Already logged in on " + (hasDifferentDevice ? "another device" : "this device") +
//                                    ". Use force logout.",
//                                    401,
//                                    false,
//                                    user.getId()
//                            ));
//                }
//            }
//
//            // Handle force logout - deactivate all existing sessions
//            if (loginRequest.isForceLogout()) {
//                int count = deviceSessionRepository.deactivateAllSessions(
//                        user.getId(),
//                        LocalDateTime.now()
//                );
//                System.out.println("Force logout - cleared " + count + " sessions");
//
//                // Notify the previous session about force logout
//                if (!activeSessions.isEmpty()) {
//                    notifyForceLogout(user.getId(), loginRequest.getDeviceId());
//                }
//            }
//            // If there are active sessions and not force logout, deactivate them to allow new session
//            else if (!activeSessions.isEmpty()) {
//                int count = deviceSessionRepository.deactivateAllSessions(
//                        user.getId(),
//                        LocalDateTime.now()
//                );
//                System.out.println("Deactivated " + count + " existing sessions to create new one");
//
//                // Notify the previous session about deactivation
//                notifyForceLogout(user.getId(), loginRequest.getDeviceId());
//            }
//
//            // Create new session
//            DeviceSession newSession = new DeviceSession();
//            newSession.setUserId(user.getId());
//            newSession.setRole(roleEnum);
//            newSession.setDeviceId(loginRequest.getDeviceId());
//            newSession.setDeviceType(loginRequest.getDeviceType());
//            newSession.setDeviceName(loginRequest.getDeviceName());
//            newSession.setFcmToken(loginRequest.getFcmToken());
//            newSession.setUserAgent(loginRequest.getUserAgent());
//            newSession.setIpAddress(loginRequest.getIpAddress());
//            newSession.setLoginTime(LocalDateTime.now());
//            newSession.setLastActivity(LocalDateTime.now());
//            newSession.setActive(true);
//            newSession.setCreatedAt(LocalDateTime.now());
//            newSession.setUpdatedAt(LocalDateTime.now());
//
//            deviceSessionRepository.save(newSession);
//            System.out.println("New session created with ID: " + newSession.getId());
//
//            // Generate JWT
//            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
//            UsernamePasswordAuthenticationToken authentication =
//                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
//            SecurityContextHolder.getContext().setAuthentication(authentication);
//            String jwt = jwtUtils.generateJwtToken(authentication);
//
//            // Update user
//            user.setLastLogin(user.getCurrentLogin());
//            user.setCurrentLogin(new Date());
//            user.setIsLoggedIn(true);
//            userRepository.save(user);
//
//            System.out.println("========== LOGIN SUCCESS ==========\n");
//
//            return ResponseEntity.ok(new JwtResponse(
//                    jwt,
//                    user.getId(),
//                    user.getUsername(),
//                    user.getEmail(),
//                    user.getFirstName(),
//                    user.getLastName(),
//                    user.getProfilePicture(),
//                    user.getWatermarkImage(),
//                    user.getLogoImage(),
//                    user.getColorTheme(),
//                    userDetails.getAuthorities().stream()
//                            .map(GrantedAuthority::getAuthority)
//                            .collect(Collectors.toList()),
//                    user.getClassName()
//            ));
//
//        } catch (Exception e) {
//            e.printStackTrace();
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new MainResponse("Error: " + e.getMessage(), 500, false));
//        }
//    }

    
    
 // Add this field at class level
    private final Map<Long, SseEmitter> sessionEmitters = new ConcurrentHashMap<>();

    // Add this endpoint for SSE connection with better timeout handling
    @GetMapping(value = "/session-stream/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamSessionStatus(@PathVariable Long userId) {
        // Set timeout to 30 minutes (1800000 ms) instead of forever
        SseEmitter emitter = new SseEmitter(1800000L);
        
        // Store emitter before sending anything
        sessionEmitters.put(userId, emitter);
        
        // Send initial heartbeat to establish connection
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("{\"status\":\"connected\", \"userId\":" + userId + "}"));
            System.out.println("SSE connection established for user: " + userId);
        } catch (IOException e) {
            System.err.println("Failed to send initial heartbeat for user " + userId + ": " + e.getMessage());
            sessionEmitters.remove(userId);
            return emitter;
        }
        
        emitter.onCompletion(() -> {
            System.out.println("SSE connection completed for user: " + userId);
            sessionEmitters.remove(userId);
        });
        
        emitter.onTimeout(() -> {
            System.out.println("SSE connection timeout for user: " + userId);
            sessionEmitters.remove(userId);
        });
        
        emitter.onError((e) -> {
            System.err.println("SSE error for user " + userId + ": " + e.getMessage());
            sessionEmitters.remove(userId);
        });
        
        return emitter;
    }

    // Updated notifyForceLogout method with better error handling
    private void notifyForceLogout(Long userId, String newDeviceId) {
        if (sessionEmitters != null && sessionEmitters.containsKey(userId)) {
            SseEmitter emitter = sessionEmitters.get(userId);
            if (emitter != null) {
                try {
                    emitter.send(SseEmitter.event()
                        .name("forceLogout")
                        .data("{\"message\":\"Your session has ended. Someone else logged into your account.\", \"newDeviceId\":\"" + newDeviceId + "\"}"));
                    emitter.complete();
                    System.out.println("Force logout notification sent to user: " + userId);
                } catch (IOException e) {
                    System.err.println("Failed to send force logout notification to user " + userId + ": " + e.getMessage());
                    sessionEmitters.remove(userId);
                }
            }
        } else {
            System.out.println("No active SSE connection for user: " + userId);
        }
    }

    // Optional: Add heartbeat scheduler to keep connections alive
    @Scheduled(fixedDelay = 30000) // Every 30 seconds
    public void sendHeartbeats() {
        for (Map.Entry<Long, SseEmitter> entry : sessionEmitters.entrySet()) {
            Long userId = entry.getKey();
            SseEmitter emitter = entry.getValue();
            try {
                emitter.send(SseEmitter.event()
                    .name("heartbeat")
                    .data("{\"timestamp\":\"" + System.currentTimeMillis() + "\"}"));
            } catch (IOException e) {
                System.err.println("Heartbeat failed for user " + userId + ": " + e.getMessage());
                sessionEmitters.remove(userId);
            }
        }
    }
   
    
    

   
//    @PostMapping("/signin")
//    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
//        try {
//            System.out.println("\n\n========== SIGNIN DEBUG START ==========");
//            System.out.println("1. Login Request Received:");
//            System.out.println("   - Username: " + loginRequest.getUsername());
//            System.out.println("   - Role: " + loginRequest.getRole());
//            System.out.println("   - Device ID: " + loginRequest.getDeviceId());
//            System.out.println("   - Device Type: " + loginRequest.getDeviceType());
//            System.out.println("   - Device Name: " + loginRequest.getDeviceName());
//            System.out.println("   - User Agent: " + loginRequest.getUserAgent());
//            System.out.println("   - IP Address: " + loginRequest.getIpAddress());
//            
//            // ========== DEVICE ID VALIDATION ==========
//            if (loginRequest.getDeviceId() == null || loginRequest.getDeviceId().isEmpty()) {
//                System.out.println("ERROR: Device ID is required");
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse("Device ID is required for login. Please provide device information.", 400, false));
//            }
//            // ===========================================
//            
//            // Convert the provided role into the enum type
//            ERole roleEnum;
//            try {
//                String roleStr = "ROLE_" + loginRequest.getRole().toUpperCase();
//                System.out.println("2. Role conversion - Input role: " + loginRequest.getRole());
//                System.out.println("   - Converted role string: " + roleStr);
//                roleEnum = ERole.valueOf(roleStr);
//                System.out.println("   - Role enum: " + roleEnum);
//            } catch (IllegalArgumentException ex) {
//                System.out.println("ERROR: Invalid role provided - " + ex.getMessage());
//                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid role provided."));
//            }
//
//            // Find user by email + role
//            System.out.println("3. Looking for user with email: " + loginRequest.getUsername() + " and role: " + roleEnum);
//            Optional<User> userOpt = userRepository.findByEmailAndRole(loginRequest.getUsername(), roleEnum);
//            
//            if (!userOpt.isPresent()) {
//                System.out.println("ERROR: User not found with email: " + loginRequest.getUsername() + " and role: " + roleEnum);
//                
//                // Debug: Check if user exists at all
//                Optional<User> userByEmail = userRepository.findByEmail(loginRequest.getUsername());
//                if (userByEmail.isPresent()) {
//                    User foundUser = userByEmail.get();
//                    System.out.println("   - User exists with email but role mismatch!");
//                    System.out.println("   - User ID: " + foundUser.getId());
//                    System.out.println("   - User status: " + foundUser.getStatus());
//                    System.out.println("   - User roles in DB: ");
//                    foundUser.getRoles().forEach(role -> {
//                        System.out.println("      * " + role.getName());
//                    });
//                } else {
//                    System.out.println("   - No user found with email: " + loginRequest.getUsername());
//                }
//                
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                        .body(new MessageResponse("Error: User not found with the given email and role. Please signup first."));
//            }
//
//            User user = userOpt.get();
//            System.out.println("4. User found successfully!");
//            System.out.println("   - User ID: " + user.getId());
//            System.out.println("   - User Email: " + user.getEmail());
//            System.out.println("   - User Status: " + user.getStatus());
//            System.out.println("   - User Roles: ");
//            user.getRoles().forEach(role -> {
//                System.out.println("      * " + role.getName());
//            });
//
//            // Validate password
//            System.out.println("5. Validating password...");
//            boolean passwordMatches = encoder.matches(loginRequest.getPassword(), user.getPassword());
//            System.out.println("   - Password matches: " + passwordMatches);
//            
//            if (!passwordMatches) {
//                System.out.println("ERROR: Password mismatch for user: " + loginRequest.getUsername());
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                        .body(new MessageResponse("Error: Bad credentials."));
//            }
//
//            // ========== ONE DEVICE ONE USER LOGIC ==========
//            System.out.println("\n6. ===== ONE DEVICE ONE USER LOGIC START =====");
//            
//            // Create DeviceInfo object with all device details
//            DeviceInfo deviceInfo = new DeviceInfo();
//            deviceInfo.setDeviceId(loginRequest.getDeviceId());
//            deviceInfo.setDeviceType(loginRequest.getDeviceType());
//            deviceInfo.setDeviceName(loginRequest.getDeviceName());
//            deviceInfo.setFcmToken(loginRequest.getFcmToken());
//            deviceInfo.setUserAgent(loginRequest.getUserAgent() != null ? loginRequest.getUserAgent() : "Unknown");
//            deviceInfo.setIpAddress(loginRequest.getIpAddress() != null ? loginRequest.getIpAddress() : "");
//            
//            System.out.println("   Device Info Created:");
//            System.out.println("      Device ID: " + deviceInfo.getDeviceId());
//            System.out.println("      Device Type: " + deviceInfo.getDeviceType());
//            System.out.println("      Device Name: " + deviceInfo.getDeviceName());
//            
//            // Get active devices BEFORE login
//            System.out.println("\n   --- Checking active devices BEFORE login ---");
//            List<DeviceSession> activeDevicesBefore = deviceManagementService.getUserActiveDevices(user.getId());
//            System.out.println("   Active devices before login: " + activeDevicesBefore.size());
//            for (DeviceSession ds : activeDevicesBefore) {
//                System.out.println("      Device ID: " + ds.getDeviceId() + 
//                                   " | Type: " + ds.getDeviceType() +
//                                   " | Active: " + ds.isActive());
//            }
//            System.out.println("   Request Device ID: " + loginRequest.getDeviceId());
//            
//            // Check if user can login from this device
//            System.out.println("\n   --- Calling canUserLoginFromDevice ---");
//            boolean canLogin = deviceManagementService.canUserLoginFromDevice(user.getId(), roleEnum, deviceInfo);
//            System.out.println("   Result from canUserLoginFromDevice: " + canLogin);
//            
//            if (!canLogin) {
//                System.out.println("\n   ERROR: User cannot login from this device - one device policy violation");
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                        .body(new MainResponse(
//                            "You are already logged in on another device. Please logout from that device first, or use force logout.", 
//                            401, 
//                            false));
//            }
//            
//            // Register or update device session
//            System.out.println("\n   --- Calling registerUserDevice ---");
//            try {
//                DeviceSession session = deviceManagementService.registerUserDevice(user.getId(), roleEnum, deviceInfo);
//                System.out.println("   Device registered successfully: " + session.getDeviceId());
//            } catch (Exception e) {
//                System.out.println("   Error registering device: " + e.getMessage());
//                e.printStackTrace();
//                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                        .body(new MainResponse("Error registering device: " + e.getMessage(), 500, false));
//            }
//            
//            // Get active devices AFTER login
//            System.out.println("\n   --- Checking active devices AFTER login ---");
//            List<DeviceSession> activeDevicesAfter = deviceManagementService.getUserActiveDevices(user.getId());
//            System.out.println("   Active devices after login: " + activeDevicesAfter.size());
//            for (DeviceSession ds : activeDevicesAfter) {
//                System.out.println("      Device ID: " + ds.getDeviceId() + 
//                                   " | Type: " + ds.getDeviceType() +
//                                   " | Active: " + ds.isActive());
//            }
//            
//            System.out.println("   ===== ONE DEVICE ONE USER LOGIC END =====\n");
//            // ===========================================
//
//            // FETCH INSTITUTE FIRST
//            System.out.println("7. Checking institute details...");
//            InstituteMaster inst = null;
//            if (user.getInstituteName() != null && !user.getInstituteName().isEmpty()) {
//                System.out.println("   - Institute name: " + user.getInstituteName());
//                inst = instituteRepository.findByInstituteNameIgnoreCase(user.getInstituteName());
//                if (inst != null) {
//                    System.out.println("   - Institute found: " + inst.getInstituteName());
//                    System.out.println("   - Institute status: " + inst.getStatus());
//                    System.out.println("   - Institute expiry: " + inst.getExpiryDate());
//                } else {
//                    System.out.println("   - Institute NOT found in database!");
//                }
//            } else {
//                System.out.println("   - No institute associated with user");
//            }
//
//            // INSTITUTE STATUS CHECK
//            if (inst != null && !"Active".equalsIgnoreCase(inst.getStatus())) {
//                System.out.println("ERROR: Institute is not active. Status: " + inst.getStatus());
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse(
//                                "Institute is not active. Please contact admin.",
//                                400,
//                                false
//                        ));
//            }
//
//            // INSTITUTE EXPIRY CHECK
//            if (inst != null &&
//                    inst.getExpiryDate() != null &&
//                    inst.getExpiryDate().before(new Date())) {
//                System.out.println("ERROR: Institute subscription expired on: " + inst.getExpiryDate());
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse(
//                                "Institute subscription has expired. Please contact institute admin.",
//                                400,
//                                false
//                        ));
//            }
//
//            // USER STATUS CHECK (AFTER INSTITUTE)
//            System.out.println("8. Checking user status...");
//            System.out.println("   - User status: " + user.getStatus());
//            if (!"Active".equalsIgnoreCase(user.getStatus())) {
//                System.out.println("ERROR: User is not active. Status: " + user.getStatus());
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse("User is not active", 400, false));
//            }
//
//            // USER EXPIRY CHECK (AFTER INSTITUTE)
//            if (user.getExpiryDate() != null && user.getExpiryDate().before(new Date())) {
//                System.out.println("ERROR: User subscription expired on: " + user.getExpiryDate());
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse("Your subscription has expired", 400, false));
//            }
//
//            System.out.println("9. All checks passed! Generating JWT token...");
//            
//            // Build UserDetails
//            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
//
//            UsernamePasswordAuthenticationToken authentication =
//                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
//            SecurityContextHolder.getContext().setAuthentication(authentication);
//
//            // Generate JWT token
//            String jwt = jwtUtils.generateJwtToken(authentication);
//            System.out.println("   - JWT Token generated successfully");
//
//            // Login timestamps
//            user.setLastLogin(user.getCurrentLogin());
//            user.setCurrentLogin(new Date());
//            user.setIsLoggedIn(true);
//            userRepository.save(user);
//            System.out.println("   - Login timestamps updated");
//
//            List<String> roles = userDetails.getAuthorities().stream()
//                    .map(GrantedAuthority::getAuthority)
//                    .collect(Collectors.toList());
//
//            System.out.println("========== SIGNIN DEBUG END - SUCCESS ==========\n\n");
//            
//            return ResponseEntity.ok(new JwtResponse(
//                    jwt,
//                    user.getId(),
//                    user.getUsername(),
//                    user.getEmail(),
//                    user.getFirstName(),
//                    user.getLastName(),
//                    user.getProfilePicture(),
//                    user.getWatermarkImage(),
//                    user.getLogoImage(),
//                    user.getColorTheme(),
//                    roles,
//                    user.getClassName()
//            ));
//            
//        } catch (Exception e) {
//            System.out.println("========== SIGNIN DEBUG - EXCEPTION ==========");
//            System.out.println("Exception occurred: " + e.getMessage());
//            System.out.println("Exception type: " + e.getClass().getName());
//            e.printStackTrace();
//            logger.error("Error in signin: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new MainResponse("Internal server error during authentication: " + e.getMessage(), 500, false));
//        }
//    }
    
    
    
    @GetMapping("/debug/active-devices/{userId}")
    public ResponseEntity<?> debugActiveDevices(@PathVariable Long userId) {
        try {
            List<DeviceSession> activeDevices = deviceManagementService.getUserActiveDevices(userId);
            
            List<Map<String, Object>> devices = new ArrayList<>();
            for (DeviceSession ds : activeDevices) {
                Map<String, Object> device = new HashMap<>();
                device.put("id", ds.getId());
                device.put("deviceId", ds.getDeviceId());
//                device.put("deviceType", ds.getDeviceType());
//                device.put("deviceName", ds.getDeviceName());
                device.put("isActive", ds.isActive());
                device.put("lastActivity", ds.getLastActivity());
                devices.add(device);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("activeDevicesCount", activeDevices.size());
            response.put("devices", devices);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    
    
//    @PostMapping("/signin")
//    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
//        try {
//            System.out.println("========== SIGNIN DEBUG START ==========");
//            System.out.println("1. Login Request Received:");
//            System.out.println("   - Username: " + loginRequest.getUsername());
//            System.out.println("   - Password: " + loginRequest.getPassword());
//            System.out.println("   - Role: " + loginRequest.getRole());
//            
//            // Convert the provided role into the enum type
//            ERole roleEnum;
//            try {
//                String roleStr = "ROLE_" + loginRequest.getRole().toUpperCase();
//                System.out.println("2. Role conversion - Input role: " + loginRequest.getRole());
//                System.out.println("   - Converted role string: " + roleStr);
//                roleEnum = ERole.valueOf(roleStr);
//                System.out.println("   - Role enum: " + roleEnum);
//            } catch (IllegalArgumentException ex) {
//                System.out.println("ERROR: Invalid role provided - " + ex.getMessage());
//                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid role provided."));
//            }
//
//            // Find user by email + role
//            System.out.println("3. Looking for user with email: " + loginRequest.getUsername() + " and role: " + roleEnum);
//            Optional<User> userOpt = userRepository.findByEmailAndRole(loginRequest.getUsername(), roleEnum);
//            
//            if (!userOpt.isPresent()) {
//                System.out.println("ERROR: User not found with email: " + loginRequest.getUsername() + " and role: " + roleEnum);
//                
//                // Debug: Check if user exists at all
//                Optional<User> userByEmail = userRepository.findByEmail(loginRequest.getUsername());
//                if (userByEmail.isPresent()) {
//                    User foundUser = userByEmail.get();
//                    System.out.println("   - User exists with email but role mismatch!");
//                    System.out.println("   - User ID: " + foundUser.getId());
//                    System.out.println("   - User status: " + foundUser.getStatus());
//                    System.out.println("   - User roles in DB: ");
//                    foundUser.getRoles().forEach(role -> {
//                        System.out.println("      * " + role.getName());
//                    });
//                } else {
//                    System.out.println("   - No user found with email: " + loginRequest.getUsername());
//                }
//                
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                        .body(new MessageResponse("Error: User not found with the given email and role."));
//            }
//
//            User user = userOpt.get();
//            System.out.println("4. User found successfully!");
//            System.out.println("   - User ID: " + user.getId());
//            System.out.println("   - User Email: " + user.getEmail());
//            System.out.println("   - User Status: " + user.getStatus());
//            System.out.println("   - User Roles: ");
//            user.getRoles().forEach(role -> {
//                System.out.println("      * " + role.getName());
//            });
//
//            // Validate password
//            System.out.println("5. Validating password...");
//            boolean passwordMatches = encoder.matches(loginRequest.getPassword(), user.getPassword());
//            System.out.println("   - Password matches: " + passwordMatches);
//            
//            if (!passwordMatches) {
//                System.out.println("ERROR: Password mismatch for user: " + loginRequest.getUsername());
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
//                        .body(new MessageResponse("Error: Bad credentials."));
//            }
//
//            // FETCH INSTITUTE FIRST
//            System.out.println("6. Checking institute details...");
//            InstituteMaster inst = null;
//            if (user.getInstituteName() != null && !user.getInstituteName().isEmpty()) {
//                System.out.println("   - Institute name: " + user.getInstituteName());
//                inst = instituteRepository.findByInstituteNameIgnoreCase(user.getInstituteName());
//                if (inst != null) {
//                    System.out.println("   - Institute found: " + inst.getInstituteName());
//                    System.out.println("   - Institute status: " + inst.getStatus());
//                    System.out.println("   - Institute expiry: " + inst.getExpiryDate());
//                } else {
//                    System.out.println("   - Institute NOT found in database!");
//                }
//            } else {
//                System.out.println("   - No institute associated with user");
//            }
//
//            // INSTITUTE STATUS CHECK
//            if (inst != null && !"Active".equalsIgnoreCase(inst.getStatus())) {
//                System.out.println("ERROR: Institute is not active. Status: " + inst.getStatus());
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse(
//                                "Institute is not active. Please contact admin.",
//                                400,
//                                false
//                        ));
//            }
//
//            // INSTITUTE EXPIRY CHECK
//            if (inst != null &&
//                    inst.getExpiryDate() != null &&
//                    inst.getExpiryDate().before(new Date())) {
//                System.out.println("ERROR: Institute subscription expired on: " + inst.getExpiryDate());
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse(
//                                "Institute subscription has expired. Please contact institute admin.",
//                                400,
//                                false
//                        ));
//            }
//
//            // USER STATUS CHECK (AFTER INSTITUTE)
//            System.out.println("7. Checking user status...");
//            System.out.println("   - User status: " + user.getStatus());
//            if (!"Active".equalsIgnoreCase(user.getStatus())) {
//                System.out.println("ERROR: User is not active. Status: " + user.getStatus());
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse("User is not active", 400, false));
//            }
//
//            // USER EXPIRY CHECK (AFTER INSTITUTE)
//            if (user.getExpiryDate() != null && user.getExpiryDate().before(new Date())) {
//                System.out.println("ERROR: User subscription expired on: " + user.getExpiryDate());
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse("Your subscription has expired", 400, false));
//            }
//
//            System.out.println("8. All checks passed! Generating JWT token...");
//            
//            // Build UserDetails
//            UserDetailsImpl userDetails = UserDetailsImpl.build(user);
//
//            UsernamePasswordAuthenticationToken authentication =
//                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
//            SecurityContextHolder.getContext().setAuthentication(authentication);
//
//            // Generate JWT token
//            String jwt = jwtUtils.generateJwtToken(authentication);
//            System.out.println("   - JWT Token generated successfully");
//
//            // Login timestamps
//            user.setLastLogin(user.getCurrentLogin());
//            user.setCurrentLogin(new Date());
//            user.setIsLoggedIn(true);
//            userRepository.save(user);
//            System.out.println("   - Login timestamps updated");
//
//            List<String> roles = userDetails.getAuthorities().stream()
//                    .map(GrantedAuthority::getAuthority)
//                    .collect(Collectors.toList());
//
//            System.out.println("========== SIGNIN DEBUG END - SUCCESS ==========");
//            
//            return ResponseEntity.ok(new JwtResponse(
//                    jwt,
//                    user.getId(),
//                    user.getUsername(),
//                    user.getEmail(),
//                    user.getFirstName(),
//                    user.getLastName(),
//                    user.getProfilePicture(),
//                    user.getWatermarkImage(),
//                    user.getLogoImage(),
//                    user.getColorTheme(),
//                    roles,
//                    user.getClassName()
//            ));
//        } catch (Exception e) {
//            System.out.println("========== SIGNIN DEBUG - EXCEPTION ==========");
//            System.out.println("Exception occurred: " + e.getMessage());
//            System.out.println("Exception type: " + e.getClass().getName());
//            e.printStackTrace();
//            logger.error("Error in signin: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new MainResponse("Internal server error during authentication: " + e.getMessage(), 500, false));
//        }
//    }

    @PostMapping("/logout/{userId}")
    @Transactional
    public ResponseEntity<?> logoutUser(@PathVariable Long userId) {
        try {
            System.out.println("\n========== LOGOUT START ==========");

            Optional<User> userOpt = userRepository.findById(userId);

            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("User not found."));
            }

            User user = userOpt.get();

            // ✅ IMPORTANT: deactivate all sessions
            int count = deviceSessionRepository.deactivateAllSessions(
                    userId,
                    LocalDateTime.now()
            );

            System.out.println("Sessions deactivated: " + count);

            // ✅ update user
            user.setIsLoggedIn(false);
            userRepository.save(user);

            System.out.println("========== LOGOUT SUCCESS ==========\n");

            return ResponseEntity.ok(new MessageResponse("User logged out successfully."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error", 500, false));
        }
    }

    @PostMapping("/register-device")
    public ResponseEntity<ApiResponse<DeviceSession>> registerDevice(@RequestBody DeviceAccessRequest request) {
        try {
            DeviceSession session = deviceManagementService.registerUserDevice(
                    request.getUserId(),
                    request.getRole(),
                    request.getDeviceInfo()
            );
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Device registered successfully",
                    session
            ));
        } catch (Exception e) {
            logger.error("Error registering device: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Failed to register device: " + e.getMessage(),
                    null
            ));
        }
    }

    
    
    @PostMapping("/force-logout-other-devices")
    public ResponseEntity<ApiResponse<String>> forceLogoutOtherDevices(
            @RequestBody ForceLogoutRequest req) {
        try {
            int loggedOut = deviceManagementService
                    .forceLogoutOtherDevices(req.getUserId(), req.getCurrentDeviceId());
            return ResponseEntity.ok(
                    new ApiResponse<>(true,
                            loggedOut + " devices logged out successfully",
                            "Success"));
        } catch (Exception e) {
            logger.error("Error force logout: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Failed to logout devices: " + e.getMessage(),
                    null
            ));
        }
    }

    @GetMapping("/user-devices/{userId}")
    public ResponseEntity<ApiResponse<Map<String, List<DeviceSession>>>> getUserDevices(@PathVariable Long userId) {
        try {
            List<DeviceSession> devices = deviceManagementService.getUserActiveDevices(userId);
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "User devices retrieved successfully",
                    Collections.singletonMap("devices", devices)
            ));
        } catch (Exception e) {
            logger.error("Error getting user devices: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Failed to get user devices: " + e.getMessage(),
                    null
            ));
        }
    }
    
    @GetMapping("/check-session/{userId}")
    public ResponseEntity<?> checkSession(@PathVariable Long userId) {
        try {
            // Check if user has any active session
            List<DeviceSession> activeSessions = deviceSessionRepository
                .findByUserIdAndActiveTrue(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("hasActiveSession", !activeSessions.isEmpty());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            return ResponseEntity.ok(errorResponse);
        }
    }
    
 // Add this endpoint for force logout notification
    @PostMapping("/notify-force-logout")
    public ResponseEntity<?> notifyForceLogout(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            String deviceId = request.get("deviceId").toString();
            
            // Store notification in a cache or send via WebSocket
            // For now, just return success
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            return ResponseEntity.ok(errorResponse);
        }
    }
    
    @PostMapping("/validate-session")
    public ResponseEntity<?> validateSession(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            String deviceId = request.get("deviceId").toString();
            
            System.out.println("Validating session for user: " + userId + ", device: " + deviceId);
            
            // Check if this specific session exists and is active
            Optional<DeviceSession> sessionOpt = deviceSessionRepository
                    .findByUserIdAndDeviceIdAndActiveTrue(userId, deviceId);
            
            if (sessionOpt.isPresent()) {
                DeviceSession session = sessionOpt.get();
                // Update last activity
                session.setLastActivity(LocalDateTime.now());
                session.setUpdatedAt(LocalDateTime.now());
                deviceSessionRepository.save(session);
                
                System.out.println("Session is valid for user: " + userId);
                Map<String, Object> response = new HashMap<>();
                response.put("valid", true);
                return ResponseEntity.ok(response);
            } else {
                // Check if user has any other active session (for debugging)
                List<DeviceSession> otherSessions = deviceSessionRepository
                        .findByUserIdAndActiveTrue(userId);
                
                System.out.println("Session NOT found for user: " + userId + ", device: " + deviceId);
                System.out.println("User has " + otherSessions.size() + " other active sessions");

                Map<String, Object> response = new HashMap<>();
                response.put("valid", false);
                response.put("message", "Session expired or logged out from another device");
                response.put("hasOtherSession", !otherSessions.isEmpty());
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            System.err.println("Session validation error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.ok(errorResponse);
        }
    }

    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            String deviceId = request.get("deviceId").toString();
            
            int count = deviceSessionRepository.deactivateSession(userId, deviceId, LocalDateTime.now());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Logged out successfully");
            response.put("sessionsDeactivated", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }
    
//    @PostMapping("/validate-session")
//    public ResponseEntity<ApiResponse<Map<String, Boolean>>> validateSession(
//            @RequestBody ValidateSessionRequest req) {
//        try {
//            boolean valid = deviceManagementService
//                    .validateUserSession(req.getUserId(), req.getDeviceId(), req.getRole());
//            return ResponseEntity.ok(new ApiResponse<>(
//                    true,
//                    "Session validation completed",
//                    Collections.singletonMap("valid", valid)));
//        } catch (Exception e) {
//            logger.error("Error validating session: {}", e.getMessage(), e);
//            return ResponseEntity.badRequest().body(new ApiResponse<>(
//                    false,
//                    "Failed to validate session: " + e.getMessage(),
//                    null
//            ));
//        }
//    }

    @GetMapping("/check-device/{userId}/{deviceId}")
    public ResponseEntity<DeviceCheckResponse> checkDevice(
            @PathVariable Long userId,
            @PathVariable String deviceId) {
        try {
            DeviceCheckResponse response = deviceManagementService.isDeviceRegistered(userId, deviceId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error in checkDevice endpoint: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(DeviceCheckResponse.builder()
                            .registered(false)
                            .canLogin(false)
                            .message("Internal server error")
                            .build());
        }
    }

    @GetMapping("/device-restrictions/{role}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDeviceRestrictions(@PathVariable String role) {
        try {
            Map<String, Object> restrictions = deviceManagementService.getDeviceRestrictionsByRole(role);
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Device restrictions retrieved",
                    restrictions
            ));
        } catch (Exception e) {
            logger.error("Error getting device restrictions: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Failed to get device restrictions: " + e.getMessage(),
                    null
            ));
        }
    }

    @PostMapping("/logout-device")
    public ResponseEntity<Map<String,Object>> logoutDevice(
            @RequestBody LogoutDeviceRequest req) {
        try {
            boolean success = deviceManagementService
                    .logoutDevice(req.getUserId(), req.getDeviceId());

            Map<String,Object> body = new HashMap<>();
            body.put("success", success);
            body.put("message", success
                    ? "Device logged out successfully"
                    : "Device not found or already inactive");
            return ResponseEntity.ok(body);
        } catch (Exception ex) {
            logger.error("Error logging out device: {}", ex.getMessage(), ex);
            Map<String,Object> body = new HashMap<>();
            body.put("success", false);
            body.put("message", "Failed to logout device: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
    }

    @PostMapping("/bulk-signup")
    public ResponseEntity<List<String>> handleBulkSignup(
            @RequestParam("creatorId") Long creatorId,
            @RequestParam("uploadRole") String uploadRole,
            @RequestParam("file") MultipartFile file
    ) {
        try {

            logger.info("========== BULK SIGNUP REQUEST ==========");
            logger.info("Creator ID  : {}", creatorId);
            logger.info("Upload Role : {}", uploadRole);
            logger.info("File Name   : {}", file.getOriginalFilename());

            List<String> results = userService.processBulkSignup1(
                    file,
                    creatorId,
                    uploadRole
            );

            return ResponseEntity.ok(results);

        } catch (IOException ie) {

            logger.error("Error processing file: {}", ie.getMessage(), ie);

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(
                            "Error processing file: " + ie.getMessage()
                    ));

        } catch (Exception e) {

            logger.error("Error in bulk signup: {}", e.getMessage(), e);

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(
                            "Error processing file: " + e.getMessage()
                    ));
        }
    }






    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody SignupRequest signUpRequest) {

        try {

            logger.info("========== SIGNUP REQUEST RECEIVED ==========");
            logger.info("Email: {}", signUpRequest.getEmail());
            logger.info("Role: {}", signUpRequest.getRole());
            logger.info("Creator ID: {}", signUpRequest.getCreatorId());

            return userService.registerUser(signUpRequest);

        } catch (Exception e) {

            logger.error(
                    "========== SIGNUP ERROR =========="
            );

            logger.error(
                    "Signup failed for email: {}",
                    signUpRequest.getEmail()
            );

            logger.error(
                    "Signup role: {}",
                    signUpRequest.getRole()
            );

            logger.error(
                    "Creator ID: {}",
                    signUpRequest.getCreatorId()
            );

            logger.error(
                    "Error message: {}",
                    e.getMessage(),
                    e
            );

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new MainResponse(
                                    "Internal server error during registration",
                                    500,
                                    false
                            )
                    );
        }
    }


    ///////////////////////

    @PutMapping("/update")
    public ResponseEntity<?> updateStudent(@RequestBody UpdateStudentRequest updateStudentRequest) {
        try {
            // Log the entire request payload
            logger.info("Update Student Request Received: {}", updateStudentRequest.toString());
            logger.info("Teacher ID in request: {}", updateStudentRequest.getTeacherId());
            logger.info("Student ID in request: {}", updateStudentRequest.getId());

            MainResponse mainResponse = this.userService.updateStudent(updateStudentRequest);

            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                logger.info("Student update successful for ID: {}", updateStudentRequest.getId());
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                logger.warn("Student update failed for ID: {}. Response: {}",
                        updateStudentRequest.getId(), mainResponse.getMessage());
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error updating student ID {}: {}",
                    updateStudentRequest != null ? updateStudentRequest.getId() : "unknown",
                    e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating student", 500, false));
        }
    }



    @GetMapping("/getbyid/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid ID is required", 400, false));
            }

            UserDetails1 details = this.userService.getById(id);
            if (details == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("User not found with ID: " + id, 404, false));
            }

            return new ResponseEntity<>(details, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting user by ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching user", 500, false));
        }
    }

    @GetMapping("/check-bulk-users")
    public ResponseEntity<?> checkBulkUsers() {
        // Get ALL users
        List<User> allUsers = userRepository.findAll();

        List<Map<String, String>> result = new ArrayList<>();

        for (User user : allUsers) {
            // Check if user has ROLE_ADMIN
            boolean isAdmin = user.getRoles().stream()
                    .anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);

            if (isAdmin) {
                Map<String, String> userInfo = new HashMap<>();
                userInfo.put("email", user.getEmail());
                userInfo.put("status", user.getStatus());
                userInfo.put("creatorId", String.valueOf(user.getCreatorId()));
                result.add(userInfo);
            }
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/getInfo/{id}")
    public ResponseEntity<?> getInfo(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid ID is required", 400, false));
            }

            UserInfo userInfo = userService.getInfoById(id);
            if (userInfo == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("User info not found with ID: " + id, 404, false));
            }

            return new ResponseEntity<>(userInfo, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting user info for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching user info", 500, false));
        }
    }

    @GetMapping("/getEditAccessById/{id}")
    public ResponseEntity<?> getEditAccessById(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid ID is required", 400, false));
            }

            User user = userRepository.findById(id).orElse(null);
            UserAccess userAccess = new UserAccess();
            userAccess.setId(id);

            if (user != null) {
                userAccess.setEditAccess(user.getEditAccess());
                return new ResponseEntity<>(userAccess, HttpStatus.OK);
            } else {
                userAccess.setEditAccess(false);
                return new ResponseEntity<>("User not found with id: " + id + ". Returning editAccess as false.", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error getting edit access for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching edit access", 500, false));
        }
    }

    @GetMapping("/getall")
    public ResponseEntity<?> getAll() {
        try {
            List<UserDetails> userDetailsList = this.userService.getAll();
            return new ResponseEntity<>(userDetailsList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting all users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching users", 500, false));
        }
    }

    @GetMapping("/getrolewiselist/{role}")
    public ResponseEntity<?> getRoleWiseList(@PathVariable("role") String role) {
        try {
            if (role == null || role.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Role is required", 400, false));
            }

            List<UserDetails> getRoleWiseList = this.userService.getRoleWiseList(role);
            return new ResponseEntity<>(getRoleWiseList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting role wise list for {}: {}", role, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching role wise list", 500, false));
        }
    }

    @GetMapping("/getallactivestudents")
    public ResponseEntity<?> getAllActiveStudents() {
        try {
            String role = "ROLE_STUDENT";
            List<UserDetails> getAllActiveStudents = this.userService.getAllActiveRoleWiseList(role);
            return new ResponseEntity<>(getAllActiveStudents, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting active students: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching active students", 500, false));
        }
    }

//    @GetMapping("/allactiveadmins")
//    public ResponseEntity<?> allActiveAdmins() {
//        try {
//            String role = "ROLE_ADMIN";
//            List<UserDetails> allActiveAdmins = this.userService.allActiveAdmins(role);
//            return new ResponseEntity<>(allActiveAdmins, HttpStatus.OK);
//        } catch (Exception e) {
//            logger.error("Error getting active admins: {}", e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new MainResponse("Internal server error fetching active admins", 500, false));
//        }
//    }

    @GetMapping("/allactiveadmins")
    public ResponseEntity<?> allActiveAdmins() {
        try {
            String role = "ROLE_ADMIN";
            List<UserDetails> allActiveAdmins = this.userService.allActiveAdmins(role);
            return new ResponseEntity<>(allActiveAdmins, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting admins: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching admins", 500, false));
        }
    }

    @DeleteMapping("/deleteadmin/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid admin ID is required", 400, false));
            }

            MainResponse mainResponse = this.userService.deleteAdmin(id);

            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                logger.info("Admin deleted successfully with ID: {}", id);
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                logger.warn("Admin deletion failed for ID: {}. Response: {}",
                        id, mainResponse.getMessage());
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error deleting admin with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error deleting admin: " + e.getMessage(),
                            500, false));
        }
    }

    @DeleteMapping("/bulk-delete-admins")
    public ResponseEntity<?> bulkDeleteAdmins(@RequestBody List<Long> adminIds) {
        try {
            if (adminIds == null || adminIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Admin IDs are required", 400, false));
            }

            List<MainResponse> results = new ArrayList<>();
            List<Long> successfulDeletions = new ArrayList<>();
            List<Long> failedDeletions = new ArrayList<>();

            for (Long id : adminIds) {
                try {
                    MainResponse response = this.userService.deleteAdmin(id);
                    if (Boolean.TRUE.equals(response.getFlag())) {
                        successfulDeletions.add(id);
                    } else {
                        failedDeletions.add(id);
                    }
                } catch (Exception e) {
                    failedDeletions.add(id);
                    logger.error("Error deleting admin ID {}: {}", id, e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("successfulDeletions", successfulDeletions);
            response.put("failedDeletions", failedDeletions);
            response.put("totalProcessed", adminIds.size());
            response.put("successCount", successfulDeletions.size());
            response.put("failureCount", failedDeletions.size());
            response.put("message", String.format("Processed %d admins. Success: %d, Failed: %d",
                    adminIds.size(),
                    successfulDeletions.size(),
                    failedDeletions.size()));

            if (failedDeletions.isEmpty()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(response);
            }

        } catch (Exception e) {
            logger.error("Error bulk deleting admins: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error bulk deleting admins: " + e.getMessage(),
                            500, false));
        }
    }

    @GetMapping("/getallactiveteachers")
    public ResponseEntity<?> getAllActiveModerators() {
        try {
            String role = "ROLE_TEACHER";
            List<UserDetails> getAllActiveStudents = this.userService.getAllActiveRoleWiseList(role);
            return new ResponseEntity<>(getAllActiveStudents, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting active teachers: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching active teachers", 500, false));
        }
    }

    @GetMapping("/allactiveinstitute")
    public ResponseEntity<?> allActiveInstitutes() {
        try {
            String role = "ROLE_INSTITUTE";
            List<UserDetails> allActiveAdmins = this.userService.allActiveInstitutes(role);
            return new ResponseEntity<>(allActiveAdmins, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting active institutes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching active institutes", 500, false));
        }
    }

    @PostMapping("/forgotpassword")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest forgotPasswordRequest) {
        try {
            MainResponse mainResponse = this.userService.forgotPassword(forgotPasswordRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error in forgot password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error in forgot password", 500, false));
        }
    }

    @PostMapping(value = "/VerificationOtpReq")
    public ResponseEntity<?> VerificationOtpReq(@RequestBody VerificationOTPRequest verificationOtpReq) {
        try {
            VerificationOTPResponse VerificationOtpResponse = userService.VerificationOtp(verificationOtpReq);
            return new ResponseEntity<>(VerificationOtpResponse, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error in OTP verification: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error in OTP verification", 500, false));
        }
    }

    @PostMapping("/newpassword")
    public ResponseEntity<?> newPassword(@RequestBody NewPasswordRequest newPasswordRequest) {
        try {
            MainResponse mainResponse = this.userService.newPassword(newPasswordRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error setting new password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error setting new password", 500, false));
        }
    }

    @PostMapping("/changepassword")
    public ResponseEntity<?> changePasswordRequest(@RequestBody ChangePasswordRequest changePasswordRequest) {
        try {
            MainResponse mainResponse = this.userService.changePasswordRequest(changePasswordRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error changing password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error changing password", 500, false));
        }
    }

    @GetMapping("/useralldetails/{id}")
    public ResponseEntity<?> userAllDetails(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid ID is required", 400, false));
            }

            User user = this.userService.userAllDetails(id);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("User not found with ID: " + id, 404, false));
            }

            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting user details for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching user details", 500, false));
        }
    }

    @GetMapping("/studentcount")
    public ResponseEntity<?> studentCount() {
        try {
            Integer count = this.userService.studentCount();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting student count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching student count", 500, false));
        }
    }

    @GetMapping("/teachercount")
    public ResponseEntity<?> teacherCount() {
        try {
            Integer count = this.userService.teacherCount();
            return new ResponseEntity<>(count, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting teacher count: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching teacher count", 500, false));
        }
    }

    @PutMapping("/updateteacher")
    public ResponseEntity<?> updateTeacher(@RequestBody UpdateTeacherRequest updateTeacherRequest) {
        try {
            MainResponse mainResponse = this.userService.updateTeacher(updateTeacherRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error updating teacher: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating teacher", 500, false));
        }
    }

    @GetMapping("/studentdetailsbyid/{id}")
    public ResponseEntity<?> studentDetailsById(@PathVariable("id") Long id) {
        try {
            logger.info("Fetching student details for ID: {}", id);

            if (id == null || id <= 0) {
                logger.warn("Invalid student ID provided: {}", id);
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID is required", 400, false));
            }

            StudentDetailsResponse studentDetailsResponse = this.userService.studentDetailsById(id);

            if (studentDetailsResponse == null) {
                logger.warn("Student not found with ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Student not found with ID: " + id, 404, false));
            }

            logger.info("Successfully fetched student details for ID: {}", id);
            return ResponseEntity.ok(studentDetailsResponse);

        } catch (NoSuchElementException e) {
            logger.error("Student not found with ID {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MainResponse("Student not found with ID: " + id, 404, false));
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for student ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(new MainResponse(e.getMessage(), 400, false));
        } catch (Exception e) {
            logger.error("Error fetching student details for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error while fetching student details", 500, false));
        }
    }

    @GetMapping("/allteachers")
    public ResponseEntity<?> allTeachers() {
        try {
            List<ProfilePatternResponse> allTeachers = this.userService.allTeachers();
            return new ResponseEntity<>(allTeachers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting all teachers: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching all teachers", 500, false));
        }
    }

    @GetMapping("/allteachers/{id}")
    public ResponseEntity<?> allTeachersByCreatorId(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid creator ID is required", 400, false));
            }

            List<ProfilePatternResponse> allTeachers = this.userService.allTeachersByCreatorId(id);
            return new ResponseEntity<>(allTeachers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting teachers by creator ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching teachers", 500, false));
        }
    }

    @GetMapping("/allstudents/{id}")
    public ResponseEntity<?> allStudentsByCreatorId(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid creator ID is required", 400, false));
            }

            List<UserDetails> allTeachers = this.userService.allStudentsByCreatorId(id);
            return new ResponseEntity<>(allTeachers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting students by creator ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching students", 500, false));
        }
    }

    @GetMapping("/allstudents")
    public ResponseEntity<?> allStudents() {
        try {
            List<UserDetails> allStudents = this.userService.allStudents();
            return new ResponseEntity<>(allStudents, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting all students: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching all students", 500, false));
        }
    }

    @GetMapping("/countof")
    public ResponseEntity<?> countOfStudentTeacherQuestion() {
        try {
            CountOfStudentTeacherQuestionResponse countOfStudentTeacherQuestionResponse = this.userService.countOfStudentTeacherQuestion();
            return new ResponseEntity<>(countOfStudentTeacherQuestionResponse, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting counts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching counts", 500, false));
        }
    }

    @PostMapping("/teacherassignments")
    public ResponseEntity<?> teacherAssignments(@RequestBody TeacherRequestAssignment teacherRequestAssignment) {
        try {
            MainResponse mainResponse = this.userService.teacherAssignments(teacherRequestAssignment);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error in teacher assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error in teacher assignments", 500, false));
        }
    }

    @PostMapping("/addteacherassignemnts")
    public ResponseEntity<?> addTeacherAssignments(@RequestBody TeacherRequestAssignment teacherRequestAssignment) {
        try {
            MainResponse mainResponse = this.userService.addTeacherAssignments(teacherRequestAssignment);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error adding teacher assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error adding teacher assignments", 500, false));
        }
    }

    @PostMapping("/addstudentassignemnts")
    public ResponseEntity<?> addStudentAssignments(@RequestBody TeacherRequestAssignment teacherRequestAssignment) {
        try {
            MainResponse mainResponse = this.userService.addStudentAssignment(teacherRequestAssignment);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error adding student assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error adding student assignments", 500, false));
        }
    }

    @PutMapping("/updateteacherassignments")
    public ResponseEntity<?> updateTeacherAssignments(@RequestBody TeacherRequestAssignment teacherRequestAssignment) {
        try {
            MainResponse mainResponse = this.userService.updateTeacherAssignments(teacherRequestAssignment);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error updating teacher assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating teacher assignments", 500, false));
        }
    }

    @PutMapping("/updatestudentassignments")
    public ResponseEntity<?> updateStudentAssignments(@RequestBody TeacherRequestAssignment teacherRequestAssignment) {
        try {
            MainResponse mainResponse = this.userService.updateStudentAssignments(teacherRequestAssignment);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error updating student assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating student assignments", 500, false));
        }
    }

    @GetMapping("/useridandentranceexamidwisedata/{id}/{entranceExamId}")
    public ResponseEntity<?> userIdAndEntranceExamIdWiseData(@PathVariable("id") Long id, @PathVariable("entranceExamId") Integer entranceExamId) {
        try {
            if (id == null || id <= 0 || entranceExamId == null || entranceExamId <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid ID and entrance exam ID are required", 400, false));
            }

            UserManagementResponse userManagementResponse = this.userService.userIdAndEntranceExamIdWiseData(id, entranceExamId);
            return new ResponseEntity<>(userManagementResponse, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting user and entrance exam data for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching user and entrance exam data", 500, false));
        }
    }

    @GetMapping("/studentidandentranceexamidwisedata/{id}/{entranceExamId}")
    public ResponseEntity<?> studentIdAndEntranceExamIdWiseData(@PathVariable("id") Long id, @PathVariable("entranceExamId") Integer entranceExamId) {
        try {
            if (id == null || id <= 0 || entranceExamId == null || entranceExamId <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid ID and entrance exam ID are required", 400, false));
            }

            UserManagementResponse userManagementResponse = this.userService.studentIdAndEntranceExamIdWiseData(id, entranceExamId);
            return new ResponseEntity<>(userManagementResponse, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting student and entrance exam data for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching student and entrance exam data", 500, false));
        }
    }

    @GetMapping("/teacheraccessmentdetails/{id}")
    public ResponseEntity<?> teacherAssessmentDetails(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid teacher ID is required", 400, false));
            }

            TeacherAssessmentDetails teacherAssessmentDetails = this.userService.teacherAssessmentDetails(id);
            if (teacherAssessmentDetails == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Teacher assessment details not found for ID: " + id, 404, false));
            }

            return new ResponseEntity<>(teacherAssessmentDetails, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting teacher assessment details for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching teacher assessment details", 500, false));
        }
    }

    @GetMapping("/teachermappeddata/{id}")
    public ResponseEntity<?> teacherMappedData(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid teacher ID is required", 400, false));
            }

            TeacherMappedData teacherMappedData = this.userService.teacherMappedData(id);
            if (teacherMappedData == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Teacher mapped data not found for ID: " + id, 404, false));
            }

            return new ResponseEntity<>(teacherMappedData, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting teacher mapped data for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching teacher mapped data", 500, false));
        }
    }

    @GetMapping("/teacherSubject/{id}")
    public ResponseEntity<?> teacherSubject(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid teacher ID is required", 400, false));
            }

            List<Integer> subjectList = userRepository.getSubjectListById(id);
            return new ResponseEntity<>(subjectList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting teacher subjects for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching teacher subjects", 500, false));
        }
    }

    @DeleteMapping("/deleteuser/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid user ID is required", 400, false));
            }

            MainResponse mainResponse = this.userService.deleteUser(id);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error deleting user with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error deleting user", 500, false));
        }
    }

    @DeleteMapping("/BulkDelete")
    public ResponseEntity<?> deleteUser(@RequestBody List<Long> userIds) {
        try {
            if (userIds == null || userIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("User IDs are required", 400, false));
            }

            userService.deleteAllByIds(userIds);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error bulk deleting users: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error bulk deleting users", 500, false));
        }
    }

    @PutMapping("/updateuserpassword")
    public ResponseEntity<?> updateUserPassword(@RequestBody NewPasswordRequest newPasswordRequest) {
        try {
            MainResponse mainResponse = this.userService.updateUserPassword(newPasswordRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error updating user password: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating user password", 500, false));
        }
    }

    @PostMapping("/studentassignments")
    public ResponseEntity<?> addStudentAssignments(@RequestBody StudentAssignmentsRequest studentAssignmentsRequest) {
        try {
            MainResponse mainResponse = this.userService.addStudentAssignments(studentAssignmentsRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error adding student assignments: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error adding student assignments", 500, false));
        }
    }

    @GetMapping("/studentidwiseallaccessmanagements/{id}")
    public ResponseEntity<?> studentIdWiseAccessManagements(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID is required", 400, false));
            }

            UserManagementResponse userManagementResponse = this.userService.studentIdWiseAccessManagements(id);
            if (userManagementResponse == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Student access management not found for ID: " + id, 404, false));
            }

            return new ResponseEntity<>(userManagementResponse, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting student access management for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching student access management", 500, false));
        }
    }
    

    @GetMapping("/studentmappeddata/{id}")
    public ResponseEntity<?> studentMappedData(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID is required", 400, false));
            }

            StudentMappedData studentMappedData = this.userService.studentMappedData(id);
            if (studentMappedData == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Student mapped data not found for ID: " + id, 404, false));
            }

            return new ResponseEntity<>(studentMappedData, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting student mapped data for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching student mapped data", 500, false));
        }
    }

    @DeleteMapping("/delete/{id}/{entranceExamId}/{standardId}")
    public ResponseEntity<?> deleteMappedDataOfTeacher(@PathVariable("id") Long id,
                                                       @PathVariable("entranceExamId") Integer entranceExamId,
                                                       @PathVariable("standardId") Integer standardId,
                                                       @RequestParam("role") String role) {
        try {
            if (id == null || id <= 0 || entranceExamId == null || entranceExamId <= 0 || standardId == null || standardId <= 0 || role == null || role.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("All parameters are required", 400, false));
            }

            MainResponse mainResponse = this.userService.deleteMappedDataOfTeacher(id, entranceExamId, standardId, role);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error deleting mapped data for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error deleting mapped data", 500, false));
        }
    }

    @GetMapping("/pendingteacherlist")
    public ResponseEntity<?> pendingTeacherList() {
        try {
            List<PendingRolesList> pendingTeacherList = this.userService.pendingTeacherList();
            return new ResponseEntity<>(pendingTeacherList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting pending teacher list: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching pending teacher list", 500, false));
        }
    }

    @GetMapping("/pendingstudentlist")
    public ResponseEntity<?> pendingStudentList() {
        try {
            List<PendingRolesList> pendingStudentList = this.userService.pendingStudentList();
            return new ResponseEntity<>(pendingStudentList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting pending student list: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching pending student list", 500, false));
        }
    }

    @GetMapping("/pendingparentlist")
    public ResponseEntity<?> pendingParentList() {
        try {
            List<PendingRolesList> pendingParentList = this.userService.pendingParentList();
            return new ResponseEntity<>(pendingParentList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting pending parent list: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching pending parent list", 500, false));
        }
    }

    @GetMapping("/pendingadminlist")
    public ResponseEntity<?> pendingAdminList() {
        try {
            List<PendingRolesList> pendingAdminList = this.userService.pendingAdminList();
            return new ResponseEntity<>(pendingAdminList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting pending admin list: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching pending admin list", 500, false));
        }
    }

    @GetMapping("/pendinginstitutelist")
    public ResponseEntity<?> pendingInstituteList() {
        try {
            List<PendingRolesList> pendingInstituteList = this.userService.pendingInstituteList();
            return new ResponseEntity<>(pendingInstituteList, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting pending institute list: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching pending institute list", 500, false));
        }
    }

    @GetMapping("/acceptuser/{id}/{acceptby}")
    public ResponseEntity<?> acceptUser(@PathVariable("id") Long id, @PathVariable("acceptby") Long acceptby) {
        try {
            if (id == null || id <= 0 || acceptby == null || acceptby <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid user ID and acceptor ID are required", 400, false));
            }

            MainResponse mainResponse = this.userService.acceptUser(id, acceptby);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error accepting user {} by {}: {}", id, acceptby, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error accepting user", 500, false));
        }
    }

    @GetMapping("/dashboarddetails")
    public ResponseEntity<?> dashBoardDetails() {
        try {
            List<DashBoardDetails> dashBoardDetails = this.userService.dashBoardDetails();
            return new ResponseEntity<>(dashBoardDetails, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting dashboard details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching dashboard details", 500, false));
        }
    }

    @GetMapping("/teacheridwiseallaccessmanagements/{id}")
    public ResponseEntity<?> teacherIdWiseAccessManagements(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid teacher ID is required", 400, false));
            }

            UserManagementResponse userManagementResponse = this.userService.teacherIdWiseAccessManagements(id);
            if (userManagementResponse == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Teacher access management not found for ID: " + id, 404, false));
            }

            return new ResponseEntity<>(userManagementResponse, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting teacher access management for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching teacher access management", 500, false));
        }
    }

    @GetMapping("/countsforsuperadmin")
    public ResponseEntity<?> usersCounts() {
        try {
            List<UsersCountResponse> usersCountResponses = this.userService.usersCounts();
            return new ResponseEntity<>(usersCountResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting user counts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching user counts", 500, false));
        }
    }

    @GetMapping("/activationcounts")
    public ResponseEntity<?> activationCounts() {
        try {
            List<ActivationCountResponse> activationCountResponses = this.userService.activationCounts();
            return new ResponseEntity<>(activationCountResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting activation counts: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching activation counts", 500, false));
        }
    }

    @PutMapping("/bulkuserchangestatus")
    public ResponseEntity<?> bulkUserChangeStatus(@RequestBody BulkUserChangeStatusRequest bulkUserChangeStatusRequest) {
        try {
            MainResponse mainResponse = this.userService.bulkUserChangeStatus(bulkUserChangeStatusRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error bulk changing user status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error bulk changing user status", 500, false));
        }
    }

    @GetMapping("/studentwiseparent/{id}")
    public ResponseEntity<?> studentWiseParent(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID is required", 400, false));
            }

            ParentDetails parentDetails = this.userService.studentWiseParent(id);
            if (parentDetails == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Parent details not found for student ID: " + id, 404, false));
            }

            return new ResponseEntity<>(parentDetails, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting parent for student ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching parent details", 500, false));
        }
    }

    @GetMapping("/acceptparent/{id}/{acceptby}")
    public ResponseEntity<?> acceptParent(@PathVariable("id") Long id, @PathVariable("acceptby") Long acceptby) {
        try {
            if (id == null || id <= 0 || acceptby == null || acceptby <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid parent ID and acceptor ID are required", 400, false));
            }

            MainResponse mainResponse = this.userService.acceptParent(id, acceptby);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error accepting parent {} by {}: {}", id, acceptby, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error accepting parent", 500, false));
        }
    }

    @PutMapping("/updateparent")
    public ResponseEntity<?> updateParent(@RequestBody ParentInformationUpdateRequest parentInformationUpdateRequest) {
        try {
            MainResponse mainResponse = this.userService.updateParent(parentInformationUpdateRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error updating parent: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating parent", 500, false));
        }
    }

    @PutMapping("/bulkparentstatuschange")
    public ResponseEntity<?> bulkParentStatusChange(@RequestBody BulkParentStatusChangeRequest bulkParentStatusChangeRequest) {
        try {
            MainResponse mainResponse = this.userService.bulkParentStatusChange(bulkParentStatusChangeRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error bulk changing parent status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error bulk changing parent status", 500, false));
        }
    }

    @GetMapping("/rolesactivities")
    public ResponseEntity<?> rolesActivities() {
        try {
            List<RolesActivitiesResponse> rolesActivitiesResponse = this.userService.rolesActivities();
            return new ResponseEntity<>(rolesActivitiesResponse, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting roles activities: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching roles activities", 500, false));
        }
    }

    @PutMapping("/updatestatus")
    public ResponseEntity<?> updateStatus(@RequestBody UpdateStatusRequest updateStatusRequest) {
        try {
            MainResponse mainResponse = this.userService.updateStatus(updateStatusRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error updating status: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating status", 500, false));
        }
    }

    @GetMapping("/getallactiveinstitutes")
    public ResponseEntity<?> getAllActiveInstitutes() {
        try {
            String role = "ROLE_INSTITUTE";
            List<InstituteDetailsResponse> instituteDetailsResponses = this.userService.getAllActiveInstitutes(role);
            return new ResponseEntity<>(instituteDetailsResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting active institutes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching active institutes", 500, false));
        }
    }

    @GetMapping("/getallactiveinstitutes/{id}")
    public ResponseEntity<?> getAllActiveInstitutesById(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid creator ID is required", 400, false));
            }

            String role = "ROLE_INSTITUTE";
            List<InstituteDetailsResponse> instituteDetailsResponses = this.userService.getAllActiveInstitutesById(role, id);
            return new ResponseEntity<>(instituteDetailsResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting active institutes by creator ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching active institutes", 500, false));
        }
    }

    @GetMapping("/getinstitutebyid/{id}")
    public ResponseEntity<?> getInstituteById(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid institute ID is required", 400, false));
            }

            InstituteDetailsResponse response = this.userService.getInstituteById(id);
            if (response == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Institute not found with ID: " + id, 404, false));
            }

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting institute by ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching institute", 500, false));
        }
    }

    @PutMapping("/updateinstitute")
    public ResponseEntity<?> updateInstitute(@RequestBody UpdateInstituteRequest updateInstituteRequest) {
        try {
            MainResponse mainResponse = this.userService.updateInstitute(updateInstituteRequest);
            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error updating institute: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating institute", 500, false));
        }
    }

    @DeleteMapping("/deleteinstitute/{id}")
    public ResponseEntity<?> deleteInstitute(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid institute ID is required", 400, false));
            }

            MainResponse mainResponse = this.userService.deleteInstitute(id);

            if (Boolean.TRUE.equals(mainResponse.getFlag())) {
                logger.info("Institute deleted successfully with ID: {}", id);
                return new ResponseEntity<>(mainResponse, HttpStatus.OK);
            } else {
                logger.warn("Institute deletion failed for ID: {}. Response: {}",
                        id, mainResponse.getMessage());
                return new ResponseEntity<>(mainResponse, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error deleting institute with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error deleting institute: " + e.getMessage(),
                            500, false));
        }
    }

    @DeleteMapping("/bulk-delete-institutes")
    public ResponseEntity<?> bulkDeleteInstitutes(@RequestBody List<Long> instituteIds) {
        try {
            if (instituteIds == null || instituteIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Institute IDs are required", 400, false));
            }

            List<MainResponse> results = new ArrayList<>();
            List<Long> successfulDeletions = new ArrayList<>();
            List<Long> failedDeletions = new ArrayList<>();

            for (Long id : instituteIds) {
                try {
                    MainResponse response = this.userService.deleteInstitute(id);
                    if (Boolean.TRUE.equals(response.getFlag())) {
                        successfulDeletions.add(id);
                    } else {
                        failedDeletions.add(id);
                    }
                } catch (Exception e) {
                    failedDeletions.add(id);
                    logger.error("Error deleting institute ID {}: {}", id, e.getMessage());
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("successfulDeletions", successfulDeletions);
            response.put("failedDeletions", failedDeletions);
            response.put("totalProcessed", instituteIds.size());
            response.put("successCount", successfulDeletions.size());
            response.put("failureCount", failedDeletions.size());
            response.put("message", String.format("Processed %d institutes. Success: %d, Failed: %d",
                    instituteIds.size(),
                    successfulDeletions.size(),
                    failedDeletions.size()));

            if (failedDeletions.isEmpty()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.MULTI_STATUS).body(response);
            }

        } catch (Exception e) {
            logger.error("Error bulk deleting institutes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error bulk deleting institutes: " + e.getMessage(),
                            500, false));
        }
    }

    @GetMapping("/getinactiveinstitutes")
    public ResponseEntity<?> getAllInActiveInstitutes() {
        try {
            List<InstituteDetailsResponse> instituteDetailsResponses = this.userService.getAllInActiveInstitutes();
            return new ResponseEntity<>(instituteDetailsResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting inactive institutes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching inactive institutes", 500, false));
        }
    }

    @GetMapping("/getStandard/{id}")
    public ResponseEntity<?> findSubjectsAssignedToStudentId(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID is required", 400, false));
            }

            List<StandardResponse1> response = userService.findSubjectsAssignedToStudentId(id);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting subjects for student ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching subjects", 500, false));
        }
    }

    @GetMapping("/institutecounts/{id}")
    public ResponseEntity<?> countsOfInstitutesUsers(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid institute ID is required", 400, false));
            }

            InstituteCountsResponse response = this.userService.countsOfInstitutesUsers(id);
            if (response == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Institute counts not found for ID: " + id, 404, false));
            }

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting institute counts for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching institute counts", 500, false));
        }
    }

    @GetMapping("/userandentranceandstandardwisesubjects/{id}/{entranceExamId}/{standardId}")
    public ResponseEntity<?> userAndEntranceExamAndStandardIdWiseSubjects(@PathVariable("id") Long id, @PathVariable("entranceExamId") Integer entranceExamId, @PathVariable("standardId") Integer standardId) {
        try {
            if (id == null || id <= 0 || entranceExamId == null || entranceExamId <= 0 || standardId == null || standardId <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("All parameters are required", 400, false));
            }

            List<SubjectMastersResponse> subjectMastersResponses = this.userService.userAndEntranceExamAndStandardIdWiseSubjects(id, entranceExamId, standardId);
            return new ResponseEntity<>(subjectMastersResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting subjects for user {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching subjects", 500, false));
        }
    }

    @GetMapping("/userandentrancewisestandards/{id}/{entranceExamId}")
    public ResponseEntity<?> userAndEntranceExamIdWiseStandards(@PathVariable("id") Long id, @PathVariable("entranceExamId") Integer entranceExamId) {
        try {
            if (id == null || id <= 0 || entranceExamId == null || entranceExamId <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid user ID and entrance exam ID are required", 400, false));
            }

            Set<StandardMasterResponse> standardMasterResponses = this.userService.userAndEntranceExamIdWiseStandards(id, entranceExamId);
            return new ResponseEntity<>(standardMasterResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting standards for user {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching standards", 500, false));
        }
    }

    @GetMapping("/teacherentranceexams/{id}")
    public ResponseEntity<?> teacherWiseEntranceExams(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid teacher ID is required", 400, false));
            }

            Set<EntranceExamResponse> entranceExamResponses = this.userService.teacherWiseEntranceExams(id);
            return new ResponseEntity<>(entranceExamResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting entrance exams for teacher {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching entrance exams", 500, false));
        }
    }

    @GetMapping("/studententranceexams/{id}")
    public ResponseEntity<?> studentEntranceExams(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID is required", 400, false));
            }

            Set<EntranceExamResponse> entranceExamResponses = this.userService.studentEntranceExams(id);
            return new ResponseEntity<>(entranceExamResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting entrance exams for student {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching entrance exams", 500, false));
        }
    }

    @GetMapping("/studentdata/{entranceExamId}/{id}")
    public ResponseEntity<?> studentData(@PathVariable("entranceExamId") Integer entranceExamId, @PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0 || entranceExamId == null || entranceExamId <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID and entrance exam ID are required", 400, false));
            }

            List<StandardSubjectResponse> StandardSubjectResponse = this.userService.studentData(entranceExamId, id);
            return new ResponseEntity<>(StandardSubjectResponse, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting student data for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching student data", 500, false));
        }
    }

    @GetMapping("/getStudentById/{id}")
    public ResponseEntity<?> getStudentById(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID is required", 400, false));
            }

            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MainResponse("Student not found with ID: " + id, 404, false));
            }

            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting student by ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching student", 500, false));
        }
    }

    @GetMapping("/getAllStudentByTeachId/{id}")
    public ResponseEntity<?> getAllStudentByTeachId(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid teacher ID is required", 400, false));
            }

            List<UserDetails> students = userService.getAllStudentByTeachId(id);
            if (students.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("No students found for this teacher."));
            }
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            logger.error("Error getting students by teacher ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching students", 500, false));
        }
    }

    @GetMapping("/getAllTestByStudent/{id}")
    public ResponseEntity<?> getAllTestNameAttemptedByThatStudent(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid student ID is required", 400, false));
            }

            List<TestNameResponse> testName = userService.getAllTestByStudent(id);
            if (testName.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new MessageResponse("No test found for this student."));
            }
            return ResponseEntity.ok(testName);
        } catch (Exception e) {
            logger.error("Error getting tests for student ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching tests", 500, false));
        }
    }

    @GetMapping("/dashboardCount/{teacherId}")
    public ResponseEntity<?> teacherDashboardCount(@PathVariable Long teacherId) {
        try {
            if (teacherId == null || teacherId <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid teacher ID is required", 400, false));
            }

            TeacherDashboardCountResponse response = userService.getTeacherDashboardCounts(teacherId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting dashboard count for teacher {}: {}", teacherId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching dashboard count", 500, false));
        }
    }

    @GetMapping("getUserStats/{id}")
    public ResponseEntity<?> getUserStats(@PathVariable("id") Long id) {
        try {
            if (id == null || id <= 0) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid user ID is required", 400, false));
            }

            List<UserStatResponse> userStatResponses = userService.getUserStats(id);
            return new ResponseEntity<>(userStatResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting user stats for ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error fetching user stats", 500, false));
        }
    }



    @GetMapping("/expiring-users/{id}")
    public ResponseEntity<?> getExpiringUsers(@PathVariable Long id) {

        List<ExpiringUserResponse> list =
                userService.getUsersExpiringInNextDays(15, id);

        return ResponseEntity.ok(list);
    }

//    @GetMapping("/expiring-users/{id}")
//    public ResponseEntity<?> getExpiringUsers(@PathVariable("id") Long id) {
//        try {
//            if (id == null || id <= 0) {
//                return ResponseEntity.badRequest()
//                        .body(new MainResponse("Valid creator ID is required", 400, false));
//            }
//
//            List<ExpiringUserResponse> list = userService.getUsersExpiringInNextDays(15, id);
//            return ResponseEntity.ok(list);
//        } catch (Exception e) {
//            logger.error("Error getting expiring users for creator {}: {}", id, e.getMessage(), e);
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body(new MainResponse("Internal server error fetching expiring users", 500, false));
//        }
//    }




    @PutMapping("/test/reschedule")
    public ResponseEntity<?> rescheduleTest(@RequestBody RescheduleTestRequest request) {
        try {
            logger.info("Reschedule test request received for testId: {}", request.getTestId());
            MainResponse response = userService.rescheduleTest(request);

            if (response.getFlag()) {
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } catch (Exception e) {
            logger.error("Error rescheduling test: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Error rescheduling test: " + e.getMessage(), 500, false));
        }
    }

    @PutMapping("/update-expiry")
    public ResponseEntity<?> updateSubscription(@RequestBody UpdateExpiryRequest req) {
        try {
            if (req.getUserId() == null || req.getUserId() <= 0 || req.getExpiryDate() == null) {
                return ResponseEntity.badRequest()
                        .body(new MainResponse("Valid user ID and expiry date are required", 400, false));
            }

            userService.updateSubscription(req.getUserId(), req.getExpiryDate());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User expiry date updated successfully");
            response.put("status", 200);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating subscription: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MainResponse("Internal server error updating subscription", 500, false));
        }
    }


    @GetMapping("/expired-users/{id}")
    public ResponseEntity<?> getExpiredUsers(
            @PathVariable("id") Long id) {

        try {

            if (id == null || id <= 0) {

                return ResponseEntity.badRequest().body(
                        new MainResponse(
                                "Valid creator ID is required",
                                400,
                                false
                        )
                );
            }

            List<ExpiringUserResponse> list =
                    userService.getExpiredUsers(id);

            return ResponseEntity.ok(list);

        } catch (Exception e) {

            logger.error(
                    "Error getting expired users : {}",
                    e.getMessage(),
                    e
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            new MainResponse(
                                    "Internal Server Error",
                                    500,
                                    false
                            )
                    );
        }
    }
}