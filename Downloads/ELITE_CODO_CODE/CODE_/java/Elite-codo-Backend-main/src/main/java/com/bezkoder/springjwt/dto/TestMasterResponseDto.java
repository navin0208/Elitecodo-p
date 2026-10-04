package com.bezkoder.springjwt.dto;
import lombok.Data;

import java.time.LocalTime;
import java.util.Date;
import java.util.List;

@Data
public class TestMasterResponseDto {

    private Integer testId;
    private String testName;
    private LocalTime startTime;
    private LocalTime endTime;
    private Double marks;
    private String testMode;
    private Date testDate;
    private String status;
    private String typeOfTest;
    private String testGeneratedId;
    private Integer testSet;

    // IDs
    private Integer testTypeId;
    private Integer entranceExamId;
    private Integer yearOfAppearanceId;

    // Display names
    private String testType;
    private String entranceExam;
    private String yearOfAppearance;
    private String createdBy;

    // Selected data
    private List<StandardDto> selectedStandards;
    private List<SubjectDto> selectedSubjects;
    private List<ChapterDto> selectedChapters;
    private List<TopicDto> selectedTopics;

    private List<QuestionDTO> questions;

    private List<ExamSetRequestDto> examSetRequests;

    private Integer totalQuestions;
}