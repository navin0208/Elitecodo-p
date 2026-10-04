package com.bezkoder.springjwt.payload.request;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.validation.constraints.*;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SignupRequest {

  private Long id;

  private String firstName;

  private String lastName;

  private String mobile;

  private Long creatorId;

  private String profilePicture;

  private Integer studentKeys;

  @NotBlank
  @Size(max = 50)
  @Email
  private String email;

  private String role;

  @NotBlank
  @Size(min = 6, max = 40)
  private String password;

  private String confirmPassword;

  private String logoImage;

  private String watermarkImage;

  private String className;

  private Long teacherId;

  private String status;

  private String colorTheme;

  private Boolean printAccess;

  private Boolean ormSheetAccess;

  private Boolean editAccess;

  private String instituteName;

  private String address;

  private String photo;

  private Integer teacherKeys;

  private String slogan;

  private Long studentId;

  private String parentStatus;

  private Date expiryDate;

  // ============================================================
  // PAYMENT DETAILS
  // ============================================================
  //
  // Payment is completed BEFORE signup.
  //
  // Frontend sends:
  // "paymentId": "pay_abc456"
  // "paymentStatus": "Completed"
  //
  // These values are used when creating the subscription
  // after the user has been successfully registered.
  // ============================================================

  private String paymentId;

  private String paymentStatus;

  // ============================================================
  // PATTERN DETAILS
  // ============================================================

  private Set<Integer> patternIds = new HashSet<>();

  // ============================================================
  // SUBSCRIPTION DURATION
  // ============================================================

  private Integer durationInMonths = 1;


  // ============================================================
  // GETTERS / SETTERS
  // ============================================================

  public Set<Integer> getPatternIds() {
    return patternIds;
  }

  public void setPatternIds(Set<Integer> patternIds) {
    this.patternIds = patternIds;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getRole() {
    return role;
  }

  public void setRole(String role) {
    this.role = role;
  }

  public Long getCreatorId() {
    return creatorId;
  }

  public void setCreatorId(Long creatorId) {
    this.creatorId = creatorId;
  }

  public String getLogoImage() {
    return logoImage;
  }

  public void setLogoImage(String logoImage) {
    this.logoImage = logoImage;
  }

  public String getWatermarkImage() {
    return watermarkImage;
  }

  public void setWatermarkImage(String watermarkImage) {
    this.watermarkImage = watermarkImage;
  }

  public String getProfilePicture() {
    return profilePicture;
  }

  public void setProfilePicture(String profilePicture) {
    this.profilePicture = profilePicture;
  }

  public String getConfirmPassword() {
    return confirmPassword;
  }

  public void setConfirmPassword(String confirmPassword) {
    this.confirmPassword = confirmPassword;
  }

  public String getClassName() {
    return className;
  }

  public void setClassName(String className) {
    this.className = className;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Integer getStudentKeys() {
    return studentKeys;
  }

  public void setStudentKeys(Integer studentKeys) {
    this.studentKeys = studentKeys;
  }

  public Long getTeacherId() {
    return teacherId;
  }

  public void setTeacherId(Long teacherId) {
    this.teacherId = teacherId;
  }

  public void setDurationInMonths(Integer durationInMonths) {
    this.durationInMonths = durationInMonths;
  }

  // ============================================================
  // PAYMENT GETTERS / SETTERS
  // ============================================================

  public String getPaymentId() {
    return paymentId;
  }

  public void setPaymentId(String paymentId) {
    this.paymentId = paymentId;
  }

  public String getPaymentStatus() {
    return paymentStatus;
  }

  public void setPaymentStatus(String paymentStatus) {
    this.paymentStatus = paymentStatus;
  }
}