package com.bezkoder.springjwt.payload.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExpiringUserResponse {

    private Long userId;

    private String name;

    private String userImg;

    private String role;

    private Long daysLeft;

    private Date expiryDate;



}

//package com.bezkoder.springjwt.payload.response;
//
//import lombok.AllArgsConstructor;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//public class ExpiringUserResponse {
//    private long userId;
//    private String name;
//    private String userImg;
//    private String role;
//    private long   daysLeft;
//}
