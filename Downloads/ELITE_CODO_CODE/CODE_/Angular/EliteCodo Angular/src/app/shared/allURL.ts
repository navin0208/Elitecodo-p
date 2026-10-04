// Authentication API's
export const authUrl = 'auth/login';
export const authsigninUrl = 'api/auth/signin';
export const getForgotPassURL = 'api/auth/forgotpassword';
export const validateOtpUrlURL = 'api/auth/VerificationOtpReq';
export const updatePassURL = 'api/auth/newpassword';


// File Upload Api
export const fileUpload = 'api/file/uploadfile';

// Dashboard Count's API
export const dashboardCountAPI = 'api/auth/countof';
export const countsforsuperadminAPI = 'api/auth/countsforsuperadmin';
export const activationcountsAPI = 'api/auth/activationcounts';


export const teacheridwiseallaccessmanagements = 'api/auth/teacheridwiseallaccessmanagements/';



export const getallteachers = 'api/auth/allteachers';

// Change Password Api by Super Admin 
export const ChangePasswordBySuperAdminOfTeacher = 'api/auth/newpassword';

// student Management API's
export const create_student = 'api/auth/signup';
export const getAll_student = 'api/auth/allstudents';
export const getActiveAll_student = 'api/auth/getallactivestudents';
export const update_student = 'api/auth/update';
export const getById_student = 'api/auth/studentdetailsbyid/';
// student Management API's
export const create_admin = 'api/auth/signup';


// export const getAll_admin = 'api/auth/alladmins';

export const getAll_admin = 'api/auth/allactiveadmins';     //admindata url

export const getActiveAll_admin = '';
export const update_admin = 'api/auth/update';
export const getById_admin = 'api/auth/getbyid/';
export const ChangePasswordBySuperAdminOfadmin = 'api/auth/newpassword';
export const assignStandardWiseDataToStudent = '';
export const studentmappeddataURL = '';
export const ChangePasswordBySuperAdminOfStudent = 'api/auth/newpassword';
export const studentidandentranceexamidwisedata = 'api/auth/studentidandentranceexamidwisedata/';
export const studentidwiseallaccessmanagements = 'api/auth/studentidwiseallaccessmanagements/';

// Institution Management API's
export const create_Institution = 'api/auth/signup';
export const getAll_Institution = '';
export const getallactiveteachers_Institution = 'api/auth/getallactiveinstitutes';
export const update_Institution = 'api/auth/updateinstitute';
export const getById_Institution = 'api/auth/getinstitutebyid/';
export const ChangePasswordByInstitution = 'api/auth/newpassword';

// Parent Management API's
export const create_parent = 'api/auth/signup';
export const getAll_parent = '';
export const getallactiveteachers_parent = '';
export const update_parent = 'api/auth/signup';
export const getById_parent = '';
export const ChangePasswordByparent = 'api/auth/newpassword';

// Teacher Management API's
export const create_teacher = 'api/auth/signup';
export const getAll_teacher = 'api/auth/getallactiveteachers';
export const getallactiveteachers_teacher = 'api/auth/getallactiveteachers';
export const update_teacher = 'api/auth/updateteacher';
export const getById_teacher = 'api/auth/useralldetails/'


export const getById_teacherAccessmentDetails = 'api/auth/teacheraccessmentdetails/';
export const teachermappeddataURL = 'api/auth/teachermappeddata/';
export const useridandentranceexamidwisedata = 'api/auth/useridandentranceexamidwisedata/';


export const assignStandardWiseData = 'api/auth/teacherassignments';


// Exam Management API's
export const create_exam = 'api/entranceexam/create';
export const getAll_exam = 'api/entranceexam/getall';
export const getActive_exam = 'api/entranceexam/activeentranceexam';
export const update_exam = 'api/entranceexam/update';
export const getById_exam = 'api/entranceexam/entranceexambyid/';

// export const entranceexamwisestandard = "api/entranceexam/entranceexamwisestandard/"

// Chapter Management API's
export const create_chapter = 'api/chapter/create';
export const getAll_chapter = 'api/chapter/getall';
export const getAllActive_chapter = 'api/chapter/getallactive';
export const update_chapter = 'api/chapter/update';
export const getById_chapter = 'api/chapter/getchapterbyid/';

// Subject Management API's
export const create_subject = 'api/subject/create';
export const getAll_subject = 'api/subject/getall';
export const getActive_subject = 'api/subject/getallactive';
export const update_subject = 'api/subject/update';
export const getById_subject = 'api/subject/getsubjectbyid/';
export const entranceexamwisesubject = 'api/subject/entranceexamwisesubjects/';


// Topic Management API's
export const create_topic = 'api/topic/create';
export const getAll_topic = 'api/topic/getall';
export const getAllActive_topic = 'api/topic/getallactive';
export const update_topic = 'api/topic/update';
export const getById_topic = 'api/topic/getbyid/';

// Topic Management API's
export const create_weightage = 'api/chapterweightage/create';
export const getAll_weightage = 'api/chapterweightage/getall';
export const getAllActive_weightage = '';
export const update_weightage = 'api/chapterweightage/update';
export const getById_weightage = 'api/chapterweightage/getbyid/';

// Sub-Topic Management API's
export const create_subtopic = 'api/subtopic/create';
export const getAll_subtopic = 'api/subtopic/getall';
export const getAllActive_subtopic = 'api/subtopic/getallactive';
export const update_subtopic = 'api/subtopic/update';
export const getById_subtopic = 'api/subtopic/getbyid/';

// Year Of Exp Management API's
export const create_yearOfExp = 'api/yearofappearance/create';
export const getAll_yearOfExp = 'api/yearofappearance/getall';
export const getAllActive_yearOfExp = 'api/yearofappearance/getallactive';
export const update_yearOfExp = 'api/yearofappearance/update';
export const getById_yearOfExp = 'api/yearofappearance/getbyid/';

// Question Level Management API's
export const create_questionLevel = 'api/questionlevel/create';
export const getAll_questionLevel = 'api/questionlevel/getall';
export const getAllActive_questionLevel = 'api/questionlevel/getallactive';
export const update_questionLevel = 'api/questionlevel/update';
export const getById_questionLevel = 'api/questionlevel/getbyid/';

// Pattern management API's
export const create_pattern = 'api/pattern/create';
export const getAll_pattern = 'api/pattern/getall';
export const getAllActive_pattern = 'api/pattern/getallactive';
export const update_pattern = 'api/pattern/update';
export const getById_pattern = 'api/pattern/getbyid/';

// Question Type Management API's
export const create_questionType = 'api/questiontype/create';
export const getAll_questionType = 'api/questiontype/getall';
export const getAllActive_questionType = 'api/questiontype/getallactive';
export const update_questionType = 'api/questiontype/update';
export const getById_questionType = 'api/questiontype/getbyid/';
export const getQuestionBygetByUserId = 'api/question/getByUserId';
export const acceptorrejectquestionURL = 'api/question/acceptorrejectquestion';



// Standard Management API's
export const create_standard = 'api/standard/create';
export const getAll_standard = 'api/standard/getallstandards';
export const getAllActive_standard = 'api/standard/allactivestandards';
export const update_standard = 'api/standard/update';
export const getById_standard = 'api/standard/getstandardbyid/';

// With Relations Data
export const entranceexamwisestandard = 'api/entranceexam/entranceexamwisestandard/'
export const standardwisesubject = 'api/subject/standardwisesubject/'
export const subjectwisechapter = 'api/chapter/subjectwisechapter/'
export const chapterwisetopics = 'api/topic/chapterwisetopics/'
export const standardwiseentranceexam = "api/standard/standardwiseentranceexam/"


// Delete Api 

export const deleteQuestion = 'api/question/delete';
export const delete_teacher = 'api/auth/deleteuser';
export const delete_student = 'api/auth/deleteuser';
export const delete_Institution = 'api/auth/deleteinstitute';
export const delete_admin = 'api/auth/deleteadmin';
export const delete_parent = '';
export const delete_Upload_Content = '';
export const delete_standard = 'api/standard/delete';
export const delete_Exam = 'api/entranceexam/delete';
export const delete_subject = 'api/subject/delete';
export const delete_Chapter = 'api/chapter/delete';
export const delete_Topic = 'api/topic/delete';
export const delete_Sub_Topic = 'api/subtopic/delete';
export const delete_Year_Of_Appearance = 'api/yearofappearance/delete';
export const delete_Pattern_master = 'api/pattern/delete';
export const delete_Question_Type = 'api/questiontype/delete';
export const delete_weightage = 'api/weightage/delete';


// mappig

// Test Management API's
export const update_test = 'api/test/update';
