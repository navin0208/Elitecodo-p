package com.bezkoder.springjwt.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class QuestionDTO {
    private Long questionId;

    private String question;

    private String option1;

    private String option2;

    private String option3;

    private String option4;

    private HashMap<Integer, String> answers = new HashMap<>();

    private String explanation;

    // Add these
    private Integer marks;

    private List<String> multiAnswers;
}
