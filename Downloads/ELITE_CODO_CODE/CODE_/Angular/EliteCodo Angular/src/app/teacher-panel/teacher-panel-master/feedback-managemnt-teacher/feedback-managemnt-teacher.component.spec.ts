import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackManagemntTeacherComponent } from './feedback-managemnt-teacher.component';

describe('FeedbackManagemntTeacherComponent', () => {
  let component: FeedbackManagemntTeacherComponent;
  let fixture: ComponentFixture<FeedbackManagemntTeacherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackManagemntTeacherComponent]
    });
    fixture = TestBed.createComponent(FeedbackManagemntTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
