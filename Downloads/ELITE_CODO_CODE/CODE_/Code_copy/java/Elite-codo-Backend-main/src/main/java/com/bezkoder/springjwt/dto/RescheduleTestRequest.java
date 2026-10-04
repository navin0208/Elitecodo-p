// This new DTo add For Reschedule Test after create a test
//This will updated on same test ID

package com.bezkoder.springjwt.dto;
import java.time.LocalDate;
import java.time.LocalTime;

public class RescheduleTestRequest {
    private Long testId;
    private LocalDate testDate;
    private LocalTime startTime;
    private LocalTime endTime;

    // Constructors
    public RescheduleTestRequest() {}

    public RescheduleTestRequest(Long testId, LocalDate testDate, LocalTime startTime, LocalTime endTime) {
        this.testId = testId;
        this.testDate = testDate;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters and Setters

    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }

    public LocalDate getTestDate() { return testDate; }
    public void setTestDate(LocalDate testDate) { this.testDate = testDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }
}