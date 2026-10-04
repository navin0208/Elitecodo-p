package com.bezkoder.springjwt.payload.response;

import lombok.*;
import java.util.Date;

@Data
@Getter
@Setter
public class InstituteDetailsResponse {
    private Long id;
    private String instituteName;
    private Integer studentKeys;
    private Integer teacherKeys;
    private String slogan;
    private String photo;
    private Date date;
    private Date expiryDate;
    private String address;
    private Long creatorId;
    private String logoImage;
    private String watermarkImage;
    private String email;
    private String mobile;
    private String status;

    public InstituteDetailsResponse() {
    }

    // Constructor with wrapper classes - can accept null values
    public InstituteDetailsResponse(Long id, String instituteName, Integer studentKeys,
                                    Integer teacherKeys, String slogan, String photo, Date date,
                                    Date expiryDate, String address, Long creatorId,
                                    String logoImage, String watermarkImage,
                                    String email, String mobile, String status) {
        this.id = id;
        this.instituteName = instituteName;
        this.studentKeys = studentKeys;
        this.teacherKeys = teacherKeys;
        this.slogan = slogan;
        this.photo = photo;
        this.date = date;
        this.expiryDate = expiryDate;
        this.address = address;
        this.creatorId = creatorId;
        this.logoImage = logoImage;
        this.watermarkImage = watermarkImage;
        this.email = email;
        this.mobile = mobile;
        this.status = status;
    }
}