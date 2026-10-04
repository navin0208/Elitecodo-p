package com.bezkoder.springjwt.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "subscription_master")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Current Usage
    private Integer currentTeachers = 0;

    private Integer currentStudents = 0;

    // Payment Details
    private String paymentId;

    private String paymentStatus = "Pending";

    private Double totalAmountPaid = 0.0;

    // Subscription Status
    private String status = "Pending";

    @Temporal(TemporalType.TIMESTAMP)
    private Date purchaseDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date expiryDate;

    // NEW FIELD
    @Column(name = "duration_in_months")
    private Integer durationInMonths = 1;

    // NEW FIELD
    @Column(name = "extended_by")
    private Long extendedBy;

    // NEW FIELD
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "extended_at")
    private Date extendedAt;

    // NEW FIELD
    @Column(name = "extension_count")
    private Integer extensionCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "order_id")
    private String orderId;
}