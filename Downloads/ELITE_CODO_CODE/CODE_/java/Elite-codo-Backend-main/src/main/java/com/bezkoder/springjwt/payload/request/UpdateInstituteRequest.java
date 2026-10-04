package com.bezkoder.springjwt.payload.request;

import lombok.Data;

import java.util.Date;

@Data
public class UpdateInstituteRequest {
    private Long id;
    private String instituteName;
    private String mobile;
    private String email;
    private String address;
    private String photo;
    private String logoImage;
    private String watermarkImage;
    private String slogan;
    private Integer studentKeys;
    private Integer teacherKeys;
    private Date expiryDate;
}