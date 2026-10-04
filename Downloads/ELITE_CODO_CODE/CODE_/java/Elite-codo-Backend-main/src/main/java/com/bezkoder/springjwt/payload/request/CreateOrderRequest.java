package com.bezkoder.springjwt.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    private Long userId;
    private Double amount;
    private String planId;
    private String planName;
    private String email;
    private String phone;
    private String name;
    private Integer maxTeachers;
    private Integer maxStudents;
}