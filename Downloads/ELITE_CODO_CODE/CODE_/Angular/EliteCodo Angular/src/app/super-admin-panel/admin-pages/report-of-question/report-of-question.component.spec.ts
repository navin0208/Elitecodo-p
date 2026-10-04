import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportOfQuestionComponent } from './report-of-question.component';

describe('ReportOfQuestionComponent', () => {
  let component: ReportOfQuestionComponent;
  let fixture: ComponentFixture<ReportOfQuestionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportOfQuestionComponent]
    });
    fixture = TestBed.createComponent(ReportOfQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
