package com.bezkoder.springjwt.payload.response;

import com.bezkoder.springjwt.utils.MaskedStringSerializer;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ParentDetails {

    private Long studentId;
    private Long id;
    private String firstName;
    private String lastName;
    private String mobile;
    private String email;
    private String colorTheme;
    private Long creatorId;
    private String status;
    @JsonSerialize(using = MaskedStringSerializer.class)
    private String password;
    private String confirmPassword;
    private String address;
}
