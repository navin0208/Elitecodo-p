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
import { InstitutionManagementComponent } from './institution-management/institution-management.component';
import { ParentManagementComponent } from './parent-management/parent-management.component';
import { AssignStandardWisedataComponent } from './assign-standard-wisedata/assign-standard-wisedata.component';
import { AssignStandardWiseDataToStudentComponent } from './assign-standard-wise-data-to-student/assign-standard-wise-data-to-student.component';
const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'teacher-management', component: TeacherManagementComponent },
  { path: 'student-management', component: StudentManagementComponent },

  { path: 'Institution-management', component: InstitutionManagementComponent },
  { path: 'parent-management', component: ParentManagementComponent },

  { path: 'exam-management', component: ExamManagementComponent },
  { path: 'standard-management', component: StandardManagementComponent },
  { path: 'subject-management', component: SubjectManagementComponent },
  { path: 'chapter-management', component: ChapterManagementComponent },
  { path: 'topic-management', component: TopicManagementComponent },

  { path: 'subTopic-management', component: SubTopicManagementComponent },
  { path: 'year-management', component: YearOfAppearanceManagementComponent },
  { path: 'pattern-management', component: QuestionLevelManagementComponent },
  { path: 'questionType-management', component: QuestionTypeManagementComponent },

  { path: 'Assign-Standard-Wise-data', component: AssignStandardWisedataComponent },
  { path: 'Assign-Standard-Wise-data-to-Student', component: AssignStandardWiseDataToStudentComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminPagesRoutingModule { }
