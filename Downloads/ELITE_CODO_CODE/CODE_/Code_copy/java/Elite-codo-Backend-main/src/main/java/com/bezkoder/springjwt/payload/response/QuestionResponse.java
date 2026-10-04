package com.bezkoder.springjwt.payload.response;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Data
@NoArgsConstructor
@Getter
@Setter
public class QuestionResponse {

    // =========================
    // Question
    // =========================

    private Integer questionId;

    private Integer marks;

    private String question;

    private String option1;

    private String option2;

    private String option3;

    private String option4;

    private Date date;

    private String status;

    private Set<String> multiAnswers;

    private String explanation;

    private String solution;

    private String questionCategory;


    // =========================
    // Standard
    // =========================

    private Integer standardId;

    private String standardName;


    // =========================
    // Entrance Exam
    // =========================

    private Integer entranceExamId;

    private String entranceExamName;


    // =========================
    // Subject
    // =========================

    private Integer subjectId;

    private String subjectName;


    // =========================
    // Chapter
    // =========================

    private Integer chapterId;

    private String chapterName;


    // =========================
    // Topic
    // =========================

    private Integer topicId;

    private String topicName;


    // =========================
    // Sub Topic
    // =========================

    private Integer subTopicId;

    private String subTopicName;


    // =========================
    // Year Of Appearance
    // =========================

    private Integer yearOfAppearanceId;

    private String yearOfAppearance;


    // =========================
    // Question Type
    // =========================

    private Integer questionTypeId;

    private String questionType;


    // =========================
    // Question Level
    // =========================

    private Integer questionLevelId;

    private String questionLevel;


    // =========================
    // Pattern
    // =========================

    private Integer patternId;

    private String patternName;


    // =========================
    // Existing Constructor
    // =========================

    public QuestionResponse(
            Integer questionId,
            String standardName,
            String chapterName,
            Integer marks,
            String question,
            String option1,
            String option2,
            String option3,
            String option4,
            String yearOfAppearance,
            Date date,
            String status,
            String solution,
            String questionCategory
    ) {

        this.questionId = questionId;
        this.standardName = standardName;
        this.chapterName = chapterName;
        this.marks = marks;
        this.question = question;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
        this.yearOfAppearance = yearOfAppearance;
        this.date = date;
        this.status = status;
        this.solution = solution;
        this.questionCategory = questionCategory;
    }


    // =========================
    // Existing Constructor
    // =========================

    public QuestionResponse(
            Integer questionId,
            String standardName,
            String chapterName,
            Integer marks,
            String question,
            String option1,
            String option2,
            String option3,
            String option4,
            String yearOfAppearance,
            Date date,
            String status,
            Set<String> multiAnswers,
            String solution,
            String questionCategory
    ) {

        this.questionId = questionId;
        this.standardName = standardName;
        this.chapterName = chapterName;
        this.marks = marks;
        this.question = question;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
        this.yearOfAppearance = yearOfAppearance;
        this.date = date;
        this.status = status;
        this.multiAnswers = multiAnswers;
        this.solution = solution;
        this.questionCategory = questionCategory;
    }
}