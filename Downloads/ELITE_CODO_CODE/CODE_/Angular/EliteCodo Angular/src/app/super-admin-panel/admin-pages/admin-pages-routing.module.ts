import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TeacherManagementComponent } from './teacher-management/teacher-management.component';
import { StudentManagementComponent } from './student-management/student-management.component';
import { ExamManagementComponent } from './exam-management/exam-management.component';
import { SubjectManagementComponent } from './subject-management/subject-management.component';
import { ChapterManagementComponent } from './chapter-management/chapter-management.component';
import { TopicManagementComponent } from './topic-management/topic-management.component';
import { StandardManagementComponent } from './standard-management/standard-management.component';
import { YearOfAppearanceManagementComponent } from './year-of-appearance-management/year-of-appearance-management.component';
import { QuestionLevelManagementComponent } from './question-level-management/question-level-management.component';
import { QuestionTypeManagementComponent } from './question-type-management/question-type-management.component';
import { SubTopicManagementComponent } from './sub-topic-management/sub-topic-management.component';
import { QuestionsManagementComponent } from './questions-management/questions-management.component';
import { QuestionStatusComponent } from './question-status/question-status.component';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import { AssignStandardWisedataComponent } from './assign-standard-wisedata/assign-standard-wisedata.component';
import { AssignStandardWiseDataToStudentComponent } from './assign-standard-wise-data-to-student/assign-standard-wise-data-to-student.component';
import { ChapterWiseWeightageComponent } from './chapter-wise-weightage/chapter-wise-weightage.component';
import { PendingUserStatusComponent } from './pending-user-status/pending-user-status.component';
import { PendingUserListComponent } from './pending-user-list/pending-user-list.component';
import { PendingUserDetailsComponent } from './pending-user-details/pending-user-details.component';
import { InstitutionManagementComponent } from './institution-management/institution-management.component';
import { ParentManagementComponent } from './parent-management/parent-management.component';
import { FeedbackManagementComponent } from './feedback-management/feedback-management.component';
import { CommunicateUserComponent } from './communicate-user/communicate-user.component';
import { StatusWiseQuestionsComponent } from './status-wise-questions/status-wise-questions.component';
import { AllAcceptedQuestionsComponent } from './all-accepted-questions/all-accepted-questions.component';
import { AdminManagementComponent } from './admin-management/admin-management.component';
import { ReportOfQuestionComponent } from './report-of-question/report-of-question.component';
// import { SubTopicManagementComponent } from './sub-topic-management/sub-topic-management.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'teacher-management', component: TeacherManagementComponent },
  { path: 'student-management', component: StudentManagementComponent },
  { path: 'Institution-management', component: InstitutionManagementComponent },
  { path: 'parent-management', component: ParentManagementComponent },
  { path: 'admin-management', component: AdminManagementComponent },


  { path: 'exam-management', component: ExamManagementComponent },
  { path: 'standard-management', component: StandardManagementComponent },
  { path: 'subject-management', component: SubjectManagementComponent },
  { path: 'chapter-management', component: ChapterManagementComponent },
  { path: 'topic-management', component: TopicManagementComponent },
  { path: 'communicate-user', component: CommunicateUserComponent },
  { path: 'status-wise-questions', component: StatusWiseQuestionsComponent },

  { path: 'subTopic-management', component: SubTopicManagementComponent },
  { path: 'year-management', component: YearOfAppearanceManagementComponent },
  { path: 'pattern-management', component: QuestionLevelManagementComponent },
  { path: 'questionType-management', component: QuestionTypeManagementComponent },

  { path: 'Chapter-Wise-weightage', component: ChapterWiseWeightageComponent },
  { path: 'question-management', component: QuestionsManagementComponent },
  { path: 'all-accepted-questions', component: AllAcceptedQuestionsComponent },

  { path: 'pending-question', component: QuestionStatusComponent },
  { path: 'view-profile', component: ViewProfileComponent },

  { path: 'feedback-management', component: FeedbackManagementComponent },
  { path: 'pending-user-status', component: PendingUserStatusComponent },
  { path: 'pending-user-list', component: PendingUserListComponent },
  { path: 'pending-user-details/:id', component: PendingUserDetailsComponent },


  { path: 'Assign-Standard-Wise-data', component: AssignStandardWisedataComponent },
  { path: 'Assign-Standard-Wise-data-to-Student', component: AssignStandardWiseDataToStudentComponent },

  { path: 'question_report', component: ReportOfQuestionComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPagesRoutingModule { }
